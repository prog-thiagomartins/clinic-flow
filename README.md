# 🩺 ClinicFlow — Sistema para Profissionais Autônomos de Saúde

## Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Python 3.11 + FastAPI + SQLAlchemy
- **Banco de dados:** PostgreSQL 16

---

## Como rodar

### Pré-requisito: Docker instalado

```bash
# Na raiz do projeto (onde está o docker-compose.yml)
docker-compose up --build
```

Aguarde todos os serviços subirem. Depois acesse:

| Serviço   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5174        |
| API Docs  | http://localhost:8001/docs   |
| Backend   | http://localhost:8001        |

---

## Entregas

| Entrega | Funcionalidade              | Status |
|---------|-----------------------------|--------|
| AC1     | Cadastro de Pacientes (CRUD)| ✅ Pronto |
| AC2     | Agendamento de Consultas    | ✅ Pronto |
| AC3     | Prontuário / Histórico      | ✅ Pronto |
| Prova   | Financeiro / Pagamentos     | ✅ Pronto |

---

## Endpoints da API

### AC1 — Pacientes

| Método | Rota                  | Descrição              |
|--------|-----------------------|------------------------|
| GET    | /api/patients/        | Listar pacientes (filtro `?search=`) |
| GET    | /api/patients/{id}    | Buscar paciente por ID |
| POST   | /api/patients/        | Criar paciente         |
| PUT    | /api/patients/{id}    | Atualizar paciente     |
| DELETE | /api/patients/{id}    | Remover paciente       |

### AC2 — Agendamentos

| Método | Rota                                | Descrição                                   |
|--------|-------------------------------------|---------------------------------------------|
| GET    | /api/appointments/                  | Listar agendamentos (filtros `?date=`, `?patient_id=`, `?status=`) |
| GET    | /api/appointments/{id}              | Buscar agendamento por ID                   |
| GET    | /api/appointments/check-conflict    | Verifica conflito de horário (apenas aviso) |
| POST   | /api/appointments/                  | Criar agendamento                           |
| PUT    | /api/appointments/{id}              | Atualizar agendamento                       |
| DELETE | /api/appointments/{id}              | Remover agendamento                         |

**Status possíveis:** `agendado`, `realizado`, `cancelado`.

**Conflito de horário:** o endpoint `check-conflict` é informativo — o frontend exibe um aviso amarelo, mas o usuário pode salvar mesmo assim.

### AC3 — Prontuários

| Método | Rota                                             | Descrição                              |
|--------|--------------------------------------------------|----------------------------------------|
| GET    | /api/medical-records/                            | Listar prontuários (filtros `?patient_id=`, `?appointment_id=`) |
| GET    | /api/medical-records/{id}                        | Buscar prontuário por ID               |
| GET    | /api/medical-records/by-appointment/{id}         | Buscar prontuário pela consulta        |
| POST   | /api/medical-records/                            | Criar prontuário (1 por consulta)      |
| PUT    | /api/medical-records/{id}                        | Atualizar prontuário                   |
| DELETE | /api/medical-records/{id}                        | Remover prontuário                     |

**Modelo:** cada prontuário é vinculado a uma consulta (relação 1:1). Campos clínicos: `chief_complaint` (queixa), `evolution`, `diagnosis` (hipótese), `treatment` (conduta), `prescription`. A queixa é obrigatória; os demais são opcionais.

### Prova — Financeiro

| Método | Rota                                   | Descrição                                   |
|--------|----------------------------------------|---------------------------------------------|
| GET    | /api/payments/                         | Listar pagamentos (filtros `?status=`, `?patient_id=`) |
| GET    | /api/payments/summary                  | Resumo: recebido, pendente e contagens (`?start=`, `?end=`) |
| GET    | /api/payments/{id}                     | Buscar pagamento por ID                     |
| GET    | /api/payments/by-appointment/{id}      | Buscar pagamento pela consulta              |
| POST   | /api/payments/                         | Criar pagamento (1 por consulta)            |
| PUT    | /api/payments/{id}                     | Atualizar pagamento                         |
| DELETE | /api/payments/{id}                     | Remover pagamento                           |

**Modelo:** cada pagamento é vinculado a uma consulta (relação 1:1). Campos:
`amount` (valor > 0), `status` (`pendente`/`pago`/`cancelado`), `method`
(forma de pagamento), `paid_at` (preenchido automaticamente ao marcar como
`pago`, se não informado) e `notes`.

**Diagramas:** ver `docs/diagrama-classes.md`, `docs/diagrama-casos-de-uso.md`
e `docs/modelo-mer.md`.
