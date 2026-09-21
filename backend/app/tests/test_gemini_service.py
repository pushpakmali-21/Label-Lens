"""Offline regression tests for Gemini input/output boundaries."""

from __future__ import annotations

import base64

from app.services import gemini_service


def test_normalise_gemini_fields_maps_prompt_contract_to_validator_contract():
    fields = gemini_service.normalise_gemini_fields({
        "manufacturer_name": "Acme Foods Pvt Ltd",
        "manufacturer_address": "Pune, Maharashtra 411001",
        "net_quantity": "0.5 kg",
        "customer_care_details": "Consumer care: 1800-000-000",
    })

    assert fields["manufacturer"] == "Acme Foods Pvt Ltd Pune, Maharashtra 411001"
    assert fields["net_weight_str"] == "0.5 kg"
    assert fields["net_weight_g"] == 500.0
    assert fields["consumer_care"] == {"name": "Consumer care: 1800-000-000"}


def test_gemini_request_uses_bytes_json_mode_and_normalises_response(monkeypatch):
    class FakeModels:
        def generate_content(self, **kwargs):
            assert kwargs["config"].response_mime_type == "application/json"
            assert kwargs["contents"][0].inline_data.mime_type == "image/png"
            return type("Response", (), {
                "text": (
                    '{"manufacturer_name":"Acme","manufacturer_address":"Pune",'
                    '"net_quantity":"500 g"}'
                )
            })()

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(gemini_service, "_build_client", lambda: FakeClient())
    image = base64.b64encode(b"\x89PNG\r\n\x1a\nrest").decode()

    result = gemini_service._call_gemini_sync(image)

    assert result is not None
    assert result["manufacturer"] == "Acme Pune"
    assert result["net_weight_g"] == 500.0
