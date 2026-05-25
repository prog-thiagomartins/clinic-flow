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
