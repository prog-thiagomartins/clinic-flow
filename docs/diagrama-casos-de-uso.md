# Diagrama de Casos de Uso — ClinicFlow

Ator principal: **Profissional de Saúde** (usuário autônomo do consultório).

```mermaid
flowchart LR
    Prof(("Profissional<br/>de Saúde"))

    subgraph Pacientes
      UC1(Cadastrar paciente)
      UC2(Editar paciente)
      UC3(Buscar / listar pacientes)
      UC4(Remover paciente)
    end

    subgraph Agendamentos
      UC5(Agendar consulta)
      UC6(Verificar conflito de horário)
      UC7(Editar / cancelar consulta)
    end

    subgraph Prontuarios["Prontuários"]
      UC8(Registrar prontuário)
      UC9(Consultar histórico clínico)
    end

    subgraph Financeiro
      UC10(Registrar pagamento)
      UC11(Marcar como pago / receber)
      UC12(Consultar resumo financeiro)
    end

    Prof --- UC1
    Prof --- UC2
    Prof --- UC3
    Prof --- UC4
    Prof --- UC5
    Prof --- UC7
    Prof --- UC8
    Prof --- UC9
    Prof --- UC10
    Prof --- UC11
    Prof --- UC12

    UC5 -. include .-> UC6
```

**Observação:** ao agendar uma consulta (UC5), o sistema executa a verificação de
conflito de horário (UC6) como passo incluído (relação «include»).
