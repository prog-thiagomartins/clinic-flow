# Design — Módulo Financeiro (Prova / 4ª entrega)

**Data:** 2026-05-25
**Projeto:** ClinicFlow — Sistema de gestão para profissionais autônomos de saúde
**Prazo da entrega:** 7 de junho de 2026

## Contexto

ClinicFlow já possui três módulos entregues, todos seguindo o mesmo padrão em
camadas (`models` → `schemas` → `routers` no backend; página de lista +
formulário no frontend):

- **AC1 — Pacientes:** CRUD com validação de CPF.
- **AC2 — Agendamentos:** consultas vinculadas a paciente, com aviso de conflito.
- **AC3 — Prontuários:** registro clínico 1:1 com a consulta.

Modelo de dados atual: `Patient` 1—N `Appointment` 1—1 `MedicalRecord`.

A 4ª entrega (Prova) implementa o **módulo Financeiro / Pagamentos**, já
previsto no código (rota `/financial`, item "Financeiro — Em breve" na sidebar,
linha "Prova" no README).

## Objetivo

Registrar o **pagamento de cada consulta**, com controle de status e um painel
de resumo financeiro, mantendo total consistência com os padrões existentes.
Entregar também os diagramas do **projeto inteiro** (classes, casos de uso, MER).

## Decisões de escopo (validadas com o usuário)

1. **Pagamento por consulta** — não é fluxo de caixa geral nem inclui despesas.
2. **Relação 1:1 com `appointments`**, criado **manualmente** (igual ao
   prontuário). Não altera o fluxo de criação de agendamento (AC2).
3. **Campos:** valor, status (pendente → pago / cancelado), forma de pagamento,
   data do pagamento, observações.
4. **Painel de resumo** (cards de totais) na página, com endpoint dedicado.
5. **Diagramas cobrem o projeto inteiro**, não apenas o Financeiro.

## Arquitetura

### Backend — entidade `Payment`

**`backend/app/models/payment.py`** — tabela `payments`:

| Campo | Tipo | Regras |
|-------|------|--------|
| `id` | Integer, PK | |
| `appointment_id` | Integer, FK → `appointments.id`, **unique**, `ondelete=CASCADE` | 1 pagamento por consulta |
| `amount` | Numeric(10, 2), not null | valor > 0 |
| `status` | String(20), not null, default `"pendente"` | `pendente` / `pago` / `cancelado` |
| `method` | String(20), nullable | `dinheiro` / `pix` / `cartao_debito` / `cartao_credito` / `transferencia` |
| `paid_at` | DateTime, nullable | preenchido ao marcar como `pago` |
| `notes` | Text, nullable | |
| `created_at` | DateTime, `server_default=func.now()` | |
| `updated_at` | DateTime, `onupdate=func.now()` | |

Relationship: `appointment = relationship("Appointment", backref=backref("payment", uselist=False, cascade="all, delete-orphan"))` — espelha o `MedicalRecord`.

**`backend/app/schemas/payment.py`** — espelha `medical_record.py`:

- `PaymentStatus = Literal["pendente", "pago", "cancelado"]`
- `PaymentMethod = Literal["dinheiro", "pix", "cartao_debito", "cartao_credito", "transferencia"]`
- `PatientMini` / `AppointmentMini` aninhados (reaproveitar o estilo já usado).
- `PaymentBase`: `appointment_id`, `amount`, `status` (default `pendente`), `method` (opcional), `paid_at` (opcional), `notes` (opcional). Validador `amount > 0`.
- `PaymentCreate(PaymentBase)`.
- `PaymentUpdate`: todos opcionais, **sem** `appointment_id` (não se troca a consulta), igual ao update do prontuário.
- `PaymentResponse(PaymentBase)`: + `id`, `created_at`, `updated_at`, `appointment` aninhado. `model_config = {"from_attributes": True}`. `amount` exposto como `float`.

**`backend/app/routers/payments.py`** — `APIRouter(prefix="/payments", tags=["Financeiro"])`:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/payments/` | Lista (filtros `?status=`, `?patient_id=`), ordenada por data da consulta desc. |
| GET | `/payments/summary` | Totais: `total_received`, `total_pending`, `count_paid`, `count_pending` (filtros `?start=&end=` por data do pagamento). |
| GET | `/payments/{id}` | Busca por ID. |
| GET | `/payments/by-appointment/{appointment_id}` | Busca pelo agendamento. |
| POST | `/payments/` | Cria; valida consulta existe (400) e que ainda não há pagamento (400). |
| PUT | `/payments/{id}` | Atualiza; se `status` vira `pago` e `paid_at` vazio, seta `paid_at = now()`. |
| DELETE | `/payments/{id}` | Remove (204). |

A rota `/summary` é declarada **antes** de `/{id}` para não ser capturada pela
rota paramétrica (mesmo cuidado que `check-conflict` e `by-appointment`).

**Registros:** adicionar import em `models/__init__.py`, `schemas/__init__.py`,
`routers/__init__.py` e `include_router` em `main.py`.

### Frontend

- **`services/api.js`** — bloco "Financeiro" com: `getPayments(filters)`,
  `getPayment(id)`, `getPaymentByAppointment(appointmentId)`, `createPayment`,
  `updatePayment`, `deletePayment`, `getPaymentSummary(filters)`.
- **`pages/Financial.jsx`** — cards de resumo (Recebido, Pendente, Nº pago,
  Nº pendente) + filtros (status, paciente) + lista de pagamentos com badge de
  status colorido e ações editar/remover. Reaproveita layout de `Records.jsx`.
- **`pages/PaymentForm.jsx`** — criar/editar. Consulta selecionável (travada em
  edição, como em `RecordForm.jsx`), valor (number), status (select), forma
  (select), data do pagamento (datetime), observações. Aceita
  `?appointment_id=` na query string para pré-fixar a consulta.
- **`App.jsx`** — substitui o `ComingSoon` por rotas reais `/financial`,
  `/financial/new`, `/financial/:id/edit`.
- **`components/Sidebar.jsx`** — remove `soon: true` do Financeiro; rótulo do
  rodapé vira `v2.0 — Prova`.
- **`pages/Appointments.jsx`** — adiciona ícone `$` (lucide `DollarSign`) no
  card da consulta linkando para `/financial/new?appointment_id=X`, espelhando
  o link de prontuário já existente.

### Mapa de status (UI)

| Status | Cor do badge |
|--------|--------------|
| `pendente` | amarelo (`bg-yellow-100 text-yellow-700`) |
| `pago` | verde (`bg-green-100 text-green-700`) |
| `cancelado` | cinza (`bg-gray-200 text-gray-600 line-through`) |

## Diagramas (projeto inteiro) — `clinicflow/docs/`

Todos em Mermaid (renderizam no GitHub e podem ser exportados para apresentar):

- **`diagrama-classes.md`** — classes `Patient`, `Appointment`,
  `MedicalRecord`, `Payment` com atributos e relações (`Patient "1" --> "N"
  Appointment`, `Appointment "1" --> "1" MedicalRecord`, `Appointment "1" -->
  "1" Payment`).
- **`diagrama-casos-de-uso.md`** — ator **Profissional de Saúde** com casos de
  uso de todos os módulos: gerenciar pacientes; agendar / gerenciar / verificar
  conflito de consultas; registrar prontuário; registrar / receber pagamento;
  consultar resumo financeiro.
- **`modelo-mer.md`** — `erDiagram` com as 4 tabelas, colunas, PK/FK e
  cardinalidades.

## Documentação

- `README.md`: tabela de Entregas (Prova → ✅ Pronto) e nova seção de endpoints
  "Prova — Financeiro".

## Fora de escopo (YAGNI)

- Despesas / fluxo de caixa geral.
- Parcelas / pagamentos parciais (1:N).
- Criação automática de cobrança ao agendar.
- Autenticação, multiusuário, relatórios em PDF.

## Critérios de sucesso

1. `docker-compose up --build` sobe os três serviços sem erro.
2. CRUD de pagamentos funciona ponta a ponta pela UI.
3. Resumo reflete corretamente recebido vs. pendente.
4. Marcar como `pago` registra a data automaticamente.
5. Não é possível criar dois pagamentos para a mesma consulta.
6. Os três diagramas renderizam e cobrem o projeto inteiro.
