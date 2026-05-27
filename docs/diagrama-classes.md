# Diagrama de Classes — ClinicFlow

```mermaid
classDiagram
    class Patient {
        +int id
        +string name
        +string cpf
        +date birth_date
        +string phone
        +string email
        +string address
        +string notes
        +datetime created_at
        +datetime updated_at
    }
    class Appointment {
        +int id
        +int patient_id
        +datetime scheduled_at
        +int duration_minutes
        +string status
        +string notes
        +datetime created_at
        +datetime updated_at
    }
    class MedicalRecord {
        +int id
        +int appointment_id
        +string chief_complaint
        +string evolution
        +string diagnosis
        +string treatment
        +string prescription
        +datetime created_at
        +datetime updated_at
    }
    class Payment {
        +int id
        +int appointment_id
        +decimal amount
        +string status
        +string method
        +datetime paid_at
        +string notes
        +datetime created_at
        +datetime updated_at
    }

    Patient "1" --> "0..*" Appointment : possui
    Appointment "1" --> "0..1" MedicalRecord : gera
    Appointment "1" --> "0..1" Payment : gera
```

**Status de `Appointment`:** `agendado` · `realizado` · `cancelado`
**Status de `Payment`:** `pendente` · `pago` · `cancelado`
**Forma de `Payment`:** `dinheiro` · `pix` · `cartao_debito` · `cartao_credito` · `transferencia`
