def _create_appointment(client):
    """Cria um paciente + consulta e devolve o id da consulta."""
    p = client.post("/api/patients/", json={
        "name": "Maria Teste",
        "cpf": "39053344705",
        "birth_date": "1990-01-01",
        "phone": "11999998888",
    })
    assert p.status_code == 201, p.text
    patient_id = p.json()["id"]
    a = client.post("/api/appointments/", json={
        "patient_id": patient_id,
        "scheduled_at": "2026-06-01T10:00:00",
        "duration_minutes": 30,
    })
    assert a.status_code == 201, a.text
    return a.json()["id"]


def test_payment_model_importavel():
    from app.models.payment import Payment
    assert Payment.__tablename__ == "payments"


def test_payment_schema_rejeita_valor_zero():
    import pytest
    from pydantic import ValidationError
    from app.schemas.payment import PaymentCreate

    with pytest.raises(ValidationError):
        PaymentCreate(appointment_id=1, amount=0)

    ok = PaymentCreate(appointment_id=1, amount=150.0)
    assert ok.status == "pendente"
    assert ok.method is None


def test_cria_pagamento_e_busca(client):
    appt_id = _create_appointment(client)
    resp = client.post("/api/payments/", json={
        "appointment_id": appt_id,
        "amount": 200.0,
        "method": "pix",
    })
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["amount"] == 200.0
    assert body["status"] == "pendente"
    assert body["appointment"]["patient"]["name"] == "Maria Teste"
    pid = body["id"]

    got = client.get(f"/api/payments/{pid}")
    assert got.status_code == 200
    assert got.json()["id"] == pid


def test_nao_permite_dois_pagamentos_na_mesma_consulta(client):
    appt_id = _create_appointment(client)
    first = client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 100.0})
    assert first.status_code == 201
    dup = client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 100.0})
    assert dup.status_code == 400


def test_pagamento_consulta_inexistente(client):
    resp = client.post("/api/payments/", json={"appointment_id": 9999, "amount": 50.0})
    assert resp.status_code == 400


def test_lista_filtra_por_status(client):
    appt_id = _create_appointment(client)
    client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 80.0, "status": "pago"})
    pagos = client.get("/api/payments/", params={"status": "pago"})
    assert pagos.status_code == 200
    assert len(pagos.json()) == 1
    pendentes = client.get("/api/payments/", params={"status": "pendente"})
    assert pendentes.json() == []


def test_busca_por_consulta(client):
    appt_id = _create_appointment(client)
    client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 90.0})
    resp = client.get(f"/api/payments/by-appointment/{appt_id}")
    assert resp.status_code == 200
    assert resp.json()["appointment_id"] == appt_id


def test_marcar_como_pago_seta_data_automaticamente(client):
    appt_id = _create_appointment(client)
    created = client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 120.0})
    pid = created.json()["id"]
    assert created.json()["paid_at"] is None

    upd = client.put(f"/api/payments/{pid}", json={"status": "pago", "method": "dinheiro"})
    assert upd.status_code == 200, upd.text
    body = upd.json()
    assert body["status"] == "pago"
    assert body["paid_at"] is not None
    assert body["method"] == "dinheiro"


def test_remove_pagamento(client):
    appt_id = _create_appointment(client)
    pid = client.post("/api/payments/", json={"appointment_id": appt_id, "amount": 60.0}).json()["id"]
    assert client.delete(f"/api/payments/{pid}").status_code == 204
    assert client.get(f"/api/payments/{pid}").status_code == 404


def test_resumo_financeiro(client):
    # 1 pago de 100, 1 pendente de 40 (em consultas distintas)
    a1 = _create_appointment(client)
    client.post("/api/payments/", json={"appointment_id": a1, "amount": 100.0, "status": "pago"})

    p2 = client.post("/api/patients/", json={
        "name": "Joao Teste", "cpf": "11144477735",
        "birth_date": "1985-05-05", "phone": "11988887777",
    }).json()
    a2 = client.post("/api/appointments/", json={
        "patient_id": p2["id"], "scheduled_at": "2026-06-02T11:00:00", "duration_minutes": 30,
    }).json()["id"]
    client.post("/api/payments/", json={"appointment_id": a2, "amount": 40.0, "status": "pendente"})

    resp = client.get("/api/payments/summary")
    assert resp.status_code == 200, resp.text
    s = resp.json()
    assert s["total_received"] == 100.0
    assert s["total_pending"] == 40.0
    assert s["count_paid"] == 1
    assert s["count_pending"] == 1
