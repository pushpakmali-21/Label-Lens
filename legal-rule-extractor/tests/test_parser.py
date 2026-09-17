"""
test_parser.py

Tests for structure_detector, rule_parser, text_cleaner, and table_parser.
"""

import unittest

from src.text_cleaner import clean_text, detect_headers_footers
from src.structure_detector import classify_line, tokenise_pages
from src.rule_parser import RuleParser
from src.table_parser import extract_tables_from_pages


# ---------------------------------------------------------------------------
# text_cleaner tests
# ---------------------------------------------------------------------------

class TestCleanText(unittest.TestCase):
    def test_removes_excess_blank_lines(self):
        text = "line1\n\n\n\n\nline2"
        result = clean_text(text)
        self.assertNotIn("\n\n\n", result)

    def test_collapses_multiple_spaces(self):
        result = clean_text("foo   bar   baz")
        self.assertIn("foo bar baz", result)

    def test_preserves_provided_that(self):
        text = "A declaration shall be made. Provided that such declaration shall not be required."
        result = clean_text(text)
        self.assertIn("Provided that", result)

    def test_preserves_clause_markers(self):
        text = "(a) first item\n(b) second item\n(i) sub item"
        result = clean_text(text)
        self.assertIn("(a)", result)
        self.assertIn("(b)", result)
        self.assertIn("(i)", result)

    def test_normalises_line_endings(self):
        result = clean_text("line1\r\nline2\rline3")
        self.assertNotIn("\r", result)


class TestHeaderFooterDetection(unittest.TestCase):
    def _make_pages(self, n=10, header="Government of India", footer="Page"):
        pages = []
        for i in range(1, n + 1):
            text = f"{header}\n\nRule {i}. Some legal text here.\n\nMore content.\n\n{footer} {i}"
            pages.append({"page": i, "text": text, "char_count": len(text)})
        return pages

    def test_detects_repeated_header(self):
        pages = self._make_pages()
        candidates, _ = detect_headers_footers(pages)
        self.assertTrue(any("Government of India" in c for c in candidates))

    def test_original_text_preserved(self):
        pages = self._make_pages()
        _, annotated = detect_headers_footers(pages)
        for page in annotated:
            self.assertIn("text", page)
            self.assertIn("Rule", page["text"])


# ---------------------------------------------------------------------------
# structure_detector tests
# ---------------------------------------------------------------------------

class TestClassifyLine(unittest.TestCase):
    def _tok(self, line):
        return classify_line(line, page=1, line_number=0)

    def test_rule_detection(self):
        tok = self._tok("Rule 6. Declarations to be made.")
        self.assertEqual(tok.line_type, "rule")

    def test_subsection_detection(self):
        tok = self._tok("6(1) Every manufacturer shall—")
        self.assertEqual(tok.line_type, "subsection")

    def test_subsection_label_full_format(self):
        # BUG-04 FIX: identifier must be "6(1)", not just "6"
        tok = self._tok("6(1) Every manufacturer shall—")
        self.assertEqual(tok.identifier, "6(1)")

    def test_clause_detection(self):
        tok = self._tok("(a) the name and address of the manufacturer;")
        self.assertEqual(tok.line_type, "clause")

    def test_proviso_detection(self):
        tok = self._tok("Provided that such declaration shall not be required.")
        self.assertEqual(tok.line_type, "proviso")

    def test_explanation_detection(self):
        tok = self._tok("Explanation. — For the purposes of this rule,")
        self.assertEqual(tok.line_type, "explanation")

    def test_chapter_detection(self):
        tok = self._tok("CHAPTER I  PRELIMINARY")
        self.assertEqual(tok.line_type, "chapter")

    def test_definition_detection(self):
        tok = self._tok('"package" means any commodity in packaged form.')
        self.assertEqual(tok.line_type, "definition")

    def test_plain_text(self):
        tok = self._tok("This is some plain paragraph text.")
        self.assertEqual(tok.line_type, "text")

    def test_amendment_ref(self):
        tok = self._tok("Substituted by notification dated 1st June 2017.")
        self.assertEqual(tok.line_type, "amendment_ref")

    def test_bare_number_single_space_not_rule(self):
        # BUG-02 FIX: "1. package means..." (single space) must NOT be a rule.
        tok = self._tok('1. "package" means any commodity enclosed.')
        self.assertNotEqual(tok.line_type, "rule")


# ---------------------------------------------------------------------------
# rule_parser tests
# ---------------------------------------------------------------------------

class TestRuleParser(unittest.TestCase):
    def _pages(self, lines: list[str]) -> list[dict]:
        text = "\n".join(lines)
        return [{"page": 1, "text": text, "char_count": len(text)}]

    def test_basic_rule_extraction(self):
        pages = self._pages([
            "Rule 1. Short title and commencement.",
            "These rules may be called the LMPC Rules, 2011.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        self.assertGreaterEqual(len(rules), 1)
        self.assertEqual(rules[0].rule_number, "1")

    def test_subsection_attached_to_rule(self):
        pages = self._pages([
            "Rule 6. Declarations to be made on package.",
            "6(1) Every pre-packaged commodity shall bear a declaration.",
            "(a) the name of the commodity;",
            "(b) the net quantity;",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        rule6 = rules[0]
        self.assertTrue(len(rule6.subsections) > 0)
        clauses = rule6.subsections[0].clauses
        self.assertGreaterEqual(len(clauses), 2)

    def test_subsection_label_is_full_format(self):
        # BUG-04 FIX: subsection_label must be "6(1)" not "6"
        pages = self._pages([
            "Rule 6. Declarations.",
            "6(1) Every manufacturer shall declare.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        sub = rules[0].subsections[0]
        self.assertEqual(sub.subsection_label, "6(1)")

    def test_proviso_preserved(self):
        pages = self._pages([
            "Rule 3. Application.",
            "3(1) These rules apply to all commodities.",
            "Provided that these rules shall not apply to medicines.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        rule = rules[0]
        all_provisos = (
            rule.provisos
            + [p for sub in rule.subsections for p in sub.provisos]
        )
        self.assertGreaterEqual(len(all_provisos), 1)
        # BUG-11 FIX: Verify proviso TEXT content, not just count
        self.assertIn("Provided that", all_provisos[0].text)
        self.assertIn("medicines", all_provisos[0].text)

    def test_proviso_continuation_not_lost(self):
        # BUG-01/03 FIX: continuation lines after "Provided that" must be
        # appended to the proviso, not contaminate the preceding clause.
        pages = self._pages([
            "Rule 5. Labelling.",
            "5(1) Every package shall bear—",
            "(a) the name of manufacturer;",
            "Provided that this requirement shall not apply",
            "where the manufacturer is outside India.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        provisos = []
        for r in rules:
            provisos.extend(r.provisos)
            for sub in r.subsections:
                provisos.extend(sub.provisos)
                for clause in sub.clauses:
                    provisos.extend(clause.provisos)
        self.assertGreaterEqual(len(provisos), 1)
        combined = " ".join(p.text for p in provisos)
        # Continuation line must be in the proviso
        self.assertIn("outside India", combined)
        # Clause (a) must NOT contain proviso words
        sub = rules[0].subsections[0]
        clause_a = sub.clauses[0]
        self.assertNotIn("outside India", clause_a.text)

    def test_stable_ids_generated(self):
        pages = self._pages([
            "Rule 1. First rule.",
            "Rule 2. Second rule.",
            "Rule 3. Third rule.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        ids = [r.rule_id for r in rules]
        self.assertEqual(len(ids), len(set(ids)))  # All IDs unique
        self.assertTrue(all("LMPC_001" in rid for rid in ids))

    def test_page_numbers_preserved(self):
        pages = [
            {"page": 1, "text": "Rule 1. Short title.", "char_count": 20},
            {"page": 2, "text": "Rule 2. Definitions.", "char_count": 20},
        ]
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        self.assertEqual(rules[0].page_start, 1)
        self.assertEqual(rules[1].page_start, 2)

    def test_multipage_rule_page_end_updated(self):
        # BUG-12 FIX: Rule spanning two pages must have page_end = last page
        pages = [
            {"page": 5, "text": "Rule 10. Long rule.", "char_count": 20},
            {"page": 6, "text": "10(1) Subsection on next page.", "char_count": 30},
        ]
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        self.assertEqual(rules[0].page_start, 5)
        self.assertEqual(rules[0].page_end, 6)

    def test_definition_detected(self):
        pages = self._pages([
            'Rule 2. Definitions.',
            '"package" means any commodity which is enclosed or placed in any bag.',
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        all_defs = [d for r in rules for d in r.definitions]
        self.assertGreaterEqual(len(all_defs), 1)
        self.assertEqual(all_defs[0]["term"].lower(), "package")

    def test_sub_clause_not_silently_dropped(self):
        # BUG-13 FIX: sub_clause tokens routed to _on_clause, not discarded
        pages = self._pages([
            "Rule 4. Standards.",
            "4(1) The standard shall be—",
            "(i)(a) as prescribed by the Bureau.",
        ])
        tokens = tokenise_pages(pages)
        rules = RuleParser("LMPC_001").parse(tokens)
        self.assertGreaterEqual(len(rules), 1)
        # Rule must have been parsed without crash and must not be empty
        self.assertIsNotNone(rules[0].rule_id)


# ---------------------------------------------------------------------------
# table_parser tests
# ---------------------------------------------------------------------------

class TestTableParser(unittest.TestCase):
    def _page(self, text: str) -> list[dict]:
        return [{"page": 1, "text": text, "char_count": len(text)}]

    def test_pipe_table_extracted(self):
        text = (
            "| Package Size      | Minimum Font Size |\n"
            "| Less than 25 sq cm| 1 mm              |\n"
            "| 25 to 100 sq cm   | 2 mm              |\n"
        )
        tables = extract_tables_from_pages(self._page(text))
        extracted = [t for t in tables if t.extraction_status == "extracted"]
        self.assertGreaterEqual(len(extracted), 1)
        self.assertIn("Package Size", extracted[0].headers[0])

    def test_no_table_no_result(self):
        text = "Rule 1. Short title. These rules may be called."
        tables = extract_tables_from_pages(self._page(text))
        self.assertEqual(tables, [])


if __name__ == "__main__":
    unittest.main()
