# Contexto e Plano de Ação para o Gemini CLI - Projeto IronFlow

Este documento serve como um guia e log de progresso para o desenvolvimento do aplicativo IronFlow, garantindo a continuidade e o alinhamento com as decisões estratégicas tomadas.

## 1. Resumo do Projeto

**Nome:** IronFlow
**Objetivo:** Construir um aplicativo de musculação "Offline-First" de alta qualidade, com foco em uma experiência de usuário rica, planos de treino guiados e funcionalidades sociais de compartilhamento.
**Visão a Longo Prazo:** Criar um ecossistema onde os usuários possam não apenas registrar seus treinos, mas também compartilhar suas criações, com um modelo de monetização baseado em funcionalidades de logging avançado (Premium).

## 2. Decisões Chave de Arquitetura e Estratégia

1.  **Offline-First:** A arquitetura principal é baseada em `expo-sqlite` como a fonte da verdade para o aplicativo. Todas as operações de UI leem e escrevem no banco de dados local primeiro, garantindo uma experiência de usuário instantânea e funcional, mesmo sem conexão com a internet.
2.  **Sincronização em Segundo Plano:** Um `SyncService` é responsável por sincronizar os dados locais (perfis de usuário, treinos, etc.) com o Firestore quando o aplicativo está online.
3.  **Biblioteca de Exercícios como Serviço (Híbrido):**
    *   **Fonte Externa:** Utilizamos a **ExerciseDB (via RapidAPI)** como a fonte primária para os dados de exercícios (instruções, músculos, etc.) devido à sua riqueza de informações e, crucialmente, aos GIFs animados.
    *   **Backend Próprio (Firestore):** Em vez de o aplicativo chamar a API diretamente, usamos um script de seeding (`scripts/seed-exercises.js`) para buscar os dados da ExerciseDB, traduzi-los para português (via Google Translate API) e populá-los em nossa própria coleção `exercises` no Firestore.
    *   **Sincronização com o App:** O `SyncService` do aplicativo é responsável por baixar esses exercícios do Firestore e salvá-los no banco de dados SQLite local. Isso nos dá controle total sobre os dados, evita custos de API e mantém a performance do app.

## 3. Plano de Ação Estratégico

### Fase 1: A Fundação - Foco na Experiência Individual

*   **✅ Etapa 1.1: Enriquecimento da Base de Dados e UI**
    *   **✅ Definição da Estrutura:** Tipos (`ExerciseDefinition`) e tabelas do banco de dados (`exercise_definitions`) foram criados.
    *   **✅ Script de Seeding:** O script `scripts/seed-exercises.js` foi criado para buscar, traduzir e popular o Firestore.
    *   **✅ Desenvolvimento da UI (com Mocks):**
        *   Criamos dados de teste (`mockExercises.ts`).
        *   Refatoramos a `AddExerciseScreen` para usar os mocks, permitindo o desenvolvimento da UI.
        *   Criamos e integramos a `ExerciseDetailScreen` para exibir os GIFs e as instruções.
    *   **🔴 BLOQUEIO ATUAL:** A cota mensal da API ExerciseDB foi excedida durante os testes. O script de seeding não pode ser executado até a renovação da cota.

*   **Etapa 1.2: Implementação de Planos de Treino (Templates)**
    *   **Próximo Passo:** Criar as tabelas `workout_plans` e `plan_workouts` no banco de dados local.
    *   **Próximo Passo:** Desenvolver a tela "Explorar Planos" para que os usuários possam visualizar e importar planos de treino para sua rotina.

*   **Etapa 1.3: Logging e Estatísticas (Básico e Premium)**
    *   **Próximo Passo:** Implementar a tela de estatísticas básicas (histórico e PRs).
    *   **Próximo Passo:** Desenvolver a tela de "Análise de Progresso" para usuários Premium, com gráficos de volume e 1RM.

### Fase 2: O Ecossistema - Foco na Comunidade

*   **Etapa 2.1: Compartilhamento de Treinos:** Implementar a lógica de gerar um ID único para um treino e salvá-lo no Firestore para que possa ser importado por outros usuários.
*   **Etapa 2.2: Perfil de Usuário Público:** Permitir que usuários se tornem "criadores", compartilhando seus planos e estatísticas.

## 4. Estado Atual e Próximos Passos Imediatos

**Onde Paramos:**
*   Finalizamos o desenvolvimento da UI para a Etapa 1.1.
*   O código-fonte está limpo, sem erros de compilação, e pronto para ser commitado.
*   Estamos bloqueados na execução do script de seeding devido ao limite da API ExerciseDB.

**Próxima Ação ao Retornar:**
1.  Fazer o commit de todo o progresso feito até agora.
2.  Iniciar o trabalho na **Etapa 1.2: Implementação de Planos de Treino**, começando pela modelagem dos dados e criação das novas telas, também utilizando dados de teste (mocks) enquanto a API de exercícios não está disponível.
