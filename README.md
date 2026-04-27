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
| AC2     | Agendamento de Consultas    | 🚧 Em breve |
| AC3     | Prontuário / Histórico      | 🚧 Em breve |
| Prova   | Financeiro / Pagamentos     | 🚧 Em breve |

---

## Endpoints da API (AC1)

| Método | Rota                  | Descrição              |
|--------|-----------------------|------------------------|
| GET    | /api/patients/        | Listar pacientes       |
| GET    | /api/patients/{id}    | Buscar paciente por ID |
| POST   | /api/patients/        | Criar paciente         |
| PUT    | /api/patients/{id}    | Atualizar paciente     |
| DELETE | /api/patients/{id}    | Remover paciente       |
