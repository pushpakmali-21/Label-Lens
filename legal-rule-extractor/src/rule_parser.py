"""
rule_parser.py

Builds hierarchical rule objects from classified LineTokens.

Hierarchy:
    Document
     └── Chapter  (optional)
          └── Rule / Section
               └── Subsection
                    └── Clause
                         └── Sub-clause
                              └── Proviso / Explanation / text

BUG-01/03 FIX: Provisos now have a persistent _current_proviso state so that
continuation lines that follow "Provided that..." on subsequent lines are
correctly appended to the proviso — not silently dropped or contaminating the
preceding clause text.
"""

import re
from dataclasses import dataclass, field
from typing import Optional

from src.structure_detector import LineToken


# ---------------------------------------------------------------------------
# ID generation helpers
# ---------------------------------------------------------------------------

def make_rule_id(doc_id: str, rule_seq: int) -> str:
    return f"{doc_id}_RULE_{rule_seq:03d}"


def make_subsection_id(rule_id: str, sub_seq: int) -> str:
    return f"{rule_id}_SUB_{sub_seq:03d}"


def make_clause_id(parent_id: str, clause_seq: int) -> str:
    return f"{parent_id}_CLAUSE_{clause_seq:03d}"


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class Proviso:
    proviso_type: str   # "proviso" | "explanation"
    text: str


@dataclass
class Clause:
    clause_id: str
    clause_label: str   # "(a)", "(i)", etc.
    text: str
    provisos: list[Proviso] = field(default_factory=list)


@dataclass
class Subsection:
    subsection_id: str
    subsection_label: str   # "6(1)", "1(2)", etc.
    text: str
    clauses: list[Clause] = field(default_factory=list)
    provisos: list[Proviso] = field(default_factory=list)
    page_start: int = 0
    page_end: int = 0


@dataclass
class Rule:
    rule_id: str
    rule_number: str
    title: str
    text: str
    subsections: list[Subsection] = field(default_factory=list)
    provisos: list[Proviso] = field(default_factory=list)
    definitions: list[dict] = field(default_factory=list)
    amendment_refs: list[str] = field(default_factory=list)
    page_start: int = 0
    page_end: int = 0
    chapter: Optional[str] = None


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

class RuleParser:
    """
    Stateful parser that walks through LineTokens and builds Rule objects.
    """

    def __init__(self, doc_id: str):
        self.doc_id = doc_id
        self.rules: list[Rule] = []

        self._rule_seq = 0
        self._sub_seq = 0
        self._clause_seq = 0

        self._current_chapter: Optional[str] = None
        self._current_rule: Optional[Rule] = None
        self._current_subsection: Optional[Subsection] = None
        self._current_clause: Optional[Clause] = None

        # BUG-01/03 FIX: Track the currently open proviso so continuation
        # lines are appended to it, not flushed into the preceding clause/subsection.
        self._current_proviso: Optional[Proviso] = None

        # Buffer for accumulating body text
        self._text_buffer: list[str] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def parse(self, tokens: list[LineToken]) -> list[Rule]:
        """Parse token stream and return list of Rule objects."""
        for token in tokens:
            self._dispatch(token)

        # Flush any trailing buffers
        self._flush_text_to_current()
        self._close_rule()

        return self.rules

    # ------------------------------------------------------------------
    # Dispatch
    # ------------------------------------------------------------------

    def _dispatch(self, token: LineToken) -> None:
        t = token.line_type

        if t == "chapter":
            self._on_chapter(token)
        elif t in ("rule", "section"):
            self._on_rule(token)
        elif t == "subsection":
            self._on_subsection(token)
        elif t in ("clause", "sub_clause"):
            # BUG-13 FIX: sub_clause now routed to _on_clause instead of
            # falling through to plain text buffer where it was silently lost.
            self._on_clause(token)
        elif t == "proviso":
            self._on_proviso(token)
        elif t == "explanation":
            self._on_explanation(token)
        elif t == "definition":
            self._on_definition(token)
        elif t == "amendment_ref":
            self._on_amendment(token)
        elif t == "schedule":
            self._on_schedule(token)
        elif t == "table_row":
            self._on_table_row(token)
        else:
            # Plain text — buffer it
            self._text_buffer.append(token.text)

    # ------------------------------------------------------------------
    # Handlers
    # ------------------------------------------------------------------

    def _on_chapter(self, token: LineToken) -> None:
        self._flush_text_to_current()
        self._close_rule()
        self._current_chapter = token.text.strip()

    def _on_rule(self, token: LineToken) -> None:
        self._flush_text_to_current()
        self._close_rule()

        self._rule_seq += 1
        self._sub_seq = 0
        self._clause_seq = 0

        rule_id = make_rule_id(self.doc_id, self._rule_seq)
        rule_number = token.identifier or str(self._rule_seq)

        self._current_rule = Rule(
            rule_id=rule_id,
            rule_number=rule_number,
            title=token.text.strip(),
            text="",
            page_start=token.page,
            page_end=token.page,
            chapter=self._current_chapter,
        )
        self._current_subsection = None
        self._current_clause = None
        self._current_proviso = None  # BUG-01 FIX

    def _on_subsection(self, token: LineToken) -> None:
        self._flush_text_to_current()

        if self._current_rule is None:
            # Promote to rule if nothing open
            self._on_rule(token)
            return

        self._sub_seq += 1
        self._clause_seq = 0

        sub_id = make_subsection_id(self._current_rule.rule_id, self._sub_seq)
        # BUG-04 FIX: identifier is now "6(1)" (set in classify_line); use it directly.
        sub_label = token.identifier or token.text[:10]

        subsection = Subsection(
            subsection_id=sub_id,
            subsection_label=sub_label,
            text="",
            page_start=token.page,
            page_end=token.page,
        )

        self._current_subsection = subsection
        self._current_clause = None
        self._current_proviso = None  # BUG-01 FIX

        if self._current_rule:
            self._current_rule.page_end = token.page
            self._current_rule.subsections.append(subsection)

    def _on_clause(self, token: LineToken) -> None:
        self._flush_text_to_current()

        # Determine parent ID
        if self._current_subsection:
            parent_id = self._current_subsection.subsection_id
        elif self._current_rule:
            parent_id = self._current_rule.rule_id
        else:
            # No parent — create a synthetic rule
            self._on_rule(token)
            parent_id = self._current_rule.rule_id

        self._clause_seq += 1
        clause_id = make_clause_id(parent_id, self._clause_seq)
        clause_label = f"({token.identifier})" if token.identifier else token.text[:6]

        clause = Clause(
            clause_id=clause_id,
            clause_label=clause_label,
            text=token.text,
        )
        self._current_clause = clause
        self._current_proviso = None  # BUG-01 FIX: new clause resets open proviso

        if self._current_subsection:
            self._current_subsection.clauses.append(clause)
        elif self._current_rule:
            # Attach as an ad-hoc subsection-less clause by creating
            # a synthetic subsection
            if not self._current_rule.subsections or \
               self._current_rule.subsections[-1].subsection_label != "_inline":
                synthetic = Subsection(
                    subsection_id=make_subsection_id(self._current_rule.rule_id, 999),
                    subsection_label="_inline",
                    text="",
                    page_start=token.page,
                    page_end=token.page,
                )
                self._current_rule.subsections.append(synthetic)
                self._current_subsection = synthetic
            self._current_subsection.clauses.append(clause)

        if self._current_rule:
            self._current_rule.page_end = token.page
        if self._current_subsection:
            self._current_subsection.page_end = token.page

    def _on_proviso(self, token: LineToken) -> None:
        # BUG-01/03 FIX: Flush buffer BEFORE creating proviso so that any
        # buffered text from the preceding clause is correctly stored there,
        # not contaminated with proviso text.
        self._flush_text_to_current()
        proviso = Proviso(proviso_type="proviso", text=token.text)
        self._attach_proviso(proviso)
        # Keep proviso open so continuation lines are appended to it.
        self._current_proviso = proviso

    def _on_explanation(self, token: LineToken) -> None:
        # Same fix as _on_proviso
        self._flush_text_to_current()
        proviso = Proviso(proviso_type="explanation", text=token.text)
        self._attach_proviso(proviso)
        self._current_proviso = proviso  # BUG-01 FIX

    def _attach_proviso(self, proviso: Proviso) -> None:
        if self._current_clause:
            self._current_clause.provisos.append(proviso)
        elif self._current_subsection:
            self._current_subsection.provisos.append(proviso)
        elif self._current_rule:
            self._current_rule.provisos.append(proviso)

    def _on_definition(self, token: LineToken) -> None:
        """Extract term + text from a definition line."""
        m = re.search(
            r'["\u201c\u2018]([^"\u201d\u2019]+)["\u201d\u2019]\s+(means|includes)',
            token.text,
            re.IGNORECASE,
        )
        if m and self._current_rule:
            self._current_rule.definitions.append(
                {
                    "term": m.group(1).strip(),
                    "definition_type": m.group(2).lower(),
                    "text": token.text,
                    "page": token.page,
                }
            )

    def _on_amendment(self, token: LineToken) -> None:
        if self._current_rule:
            self._current_rule.amendment_refs.append(token.text)

    def _on_schedule(self, token: LineToken) -> None:
        # Treat schedules as top-level rules with a distinctive marker
        self._flush_text_to_current()
        self._close_rule()

        self._rule_seq += 1
        rule_id = make_rule_id(self.doc_id, self._rule_seq)

        self._current_rule = Rule(
            rule_id=rule_id,
            rule_number=f"SCHEDULE_{self._rule_seq}",
            title=token.text.strip(),
            text="",
            page_start=token.page,
            page_end=token.page,
            chapter=self._current_chapter,
        )
        self._current_subsection = None
        self._current_clause = None
        self._current_proviso = None  # BUG-01 FIX

    def _on_table_row(self, token: LineToken) -> None:
        # Accumulate table rows as text; table_parser.py does deeper parsing
        self._text_buffer.append(token.text)

    # ------------------------------------------------------------------
    # Buffer helpers
    # ------------------------------------------------------------------

    def _flush_text_to_current(self) -> None:
        if not self._text_buffer:
            return
        combined = " ".join(self._text_buffer).strip()
        self._text_buffer = []

        if combined:
            # BUG-01/03 FIX: If a proviso is currently open, continuation text
            # belongs to the proviso, not to the preceding clause/subsection.
            if self._current_proviso:
                self._current_proviso.text = (
                    (self._current_proviso.text + " " + combined).strip()
                )
            elif self._current_clause:
                self._current_clause.text = (
                    (self._current_clause.text + " " + combined).strip()
                )
            elif self._current_subsection:
                self._current_subsection.text = (
                    (self._current_subsection.text + " " + combined).strip()
                )
            elif self._current_rule:
                self._current_rule.text = (
                    (self._current_rule.text + " " + combined).strip()
                )

    def _close_rule(self) -> None:
        if self._current_rule:
            self.rules.append(self._current_rule)
            self._current_rule = None
            self._current_subsection = None
            self._current_clause = None
            self._current_proviso = None  # BUG-01 FIX
