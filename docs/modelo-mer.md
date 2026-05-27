# Modelo Entidade-Relacionamento (MER) — ClinicFlow

Banco: PostgreSQL 16.

```mermaid
erDiagram
    PATIENTS ||--o{ APPOINTMENTS : "possui"
    APPOINTMENTS ||--o| MEDICAL_RECORDS : "gera"
    APPOINTMENTS ||--o| PAYMENTS : "gera"

    PATIENTS {
        int id PK
        varchar name
        varchar cpf UK
        date birth_date
        varchar phone
        varchar email
        varchar address
        text notes
        timestamp created_at
        timestamp updated_at
    }
    APPOINTMENTS {
        int id PK
        int patient_id FK
        timestamp scheduled_at
        int duration_minutes
        varchar status
        text notes
        timestamp created_at
        timestamp updated_at
    }
    MEDICAL_RECORDS {
        int id PK
        int appointment_id FK_UK
        text chief_complaint
        text evolution
        varchar diagnosis
        text treatment
        text prescription
        timestamp created_at
        timestamp updated_at
    }
    PAYMENTS {
        int id PK
        int appointment_id FK_UK
        numeric amount
        varchar status
        varchar method
        timestamp paid_at
        text notes
        timestamp created_at
        timestamp updated_at
    }
```

**Cardinalidades:**
- Um **paciente** tem zero ou muitos **agendamentos** (1:N).
- Um **agendamento** tem zero ou um **prontuário** (1:1 — `appointment_id` único).
- Um **agendamento** tem zero ou um **pagamento** (1:1 — `appointment_id` único).

**Legenda:** PK = chave primária · FK = chave estrangeira · UK = única ·
FK_UK = chave estrangeira com restrição de unicidade (garante o vínculo 1:1).
