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
| Frontend  | http://localhost:5173        |
| API Docs  | http://localhost:8000/docs   |
| Backend   | http://localhost:8000        |

---

## Entregas

| Entrega | Funcionalidade              | Status |
|---------|-----------------------------|--------|
| AC1     | Cadastro de Pacientes (CRUD)| ✅ Pronto |
| AC2     | Agendamento de Consultas    | ✅ Pronto |
| AC3     | Prontuário / Histórico      | 🚧 Em breve |
| Prova   | Financeiro / Pagamentos     | 🚧 Em breve |

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
