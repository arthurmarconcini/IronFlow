# IronFlow 🚀

IronFlow é um aplicativo de musculação para dispositivos móveis, construído com React Native e Expo, projetado com uma robusta arquitetura **Offline-First**. Ele garante que os usuários possam registrar e acessar seus treinos de forma rápida e confiável, com ou sem conexão à internet.

## ✨ Filosofia da Arquitetura

O núcleo do IronFlow é sua resiliência. A arquitetura foi projetada para fornecer uma experiência de usuário impecável, independentemente do estado da rede.

-   **Local-First Data:** Todos os dados são primeiramente escritos em um banco de dados local (SQLite). A UI reage instantaneamente a essa escrita, proporcionando feedback imediato ao usuário.
-   **Sincronização em Segundo Plano:** Um motor de sincronização inteligente é responsável por enviar as alterações locais para o backend (Firestore) quando o aplicativo está online.
-   **Resolução de Conflitos:** A sincronização utiliza uma estratégia de "read-before-write" com timestamps do servidor para resolver conflitos, garantindo a integridade dos dados em cenários de múltiplos dispositivos.
-   **Feedback Global:** A UI fornece feedback constante e não intrusivo sobre o status da conectividade e da sincronização através de indicadores globais no cabeçalho.

---

## 📋 Funcionalidades Atuais

-   **Autenticação de Usuário:** Sistema completo de login e registro com Firebase Auth.
-   **Fluxo de Onboarding:**
    -   Um fluxo guiado de múltiplos passos para novos usuários.
    -   Coleta de metas (Ganhar Massa, Perder Gordura, etc.).
    -   Coleta de dados biométricos (altura e peso) com sliders interativos.
    -   Cálculo de IMC e categoria.
-   **Gerenciamento de Perfil Offline-First:**
    -   O perfil do usuário é salvo localmente e sincronizado com o Firestore.
    -   Lógica robusta que diferencia novos usuários de usuários existentes em novos dispositivos, evitando que o onboarding seja repetido.
    -   Tela de perfil com exibição de dados e seletor de unidades (métrico/imperial).
    -   Tela de edição de perfil que segue o mesmo padrão offline-first.
-   **Motor de Sincronização Resiliente:**
    -   Máquina de estados (`dirty`, `syncing`, `synced`, `error`) para cada registro.
    -   Lógica de backoff exponencial para lidar com falhas de rede de forma inteligente.
    -   Gatilhos de sincronização automáticos (ao ficar online e após escritas locais).
-   **UI de Feedback Global:**
    -   Indicador de conectividade (online/offline) em tempo real.
    -   Indicador de atividade de sincronização em tempo real.
-   **Gerenciamento de Treinos (CRUD Offline-First):**
    -   Criação, edição, visualização de detalhes e exclusão de treinos e exercícios.
    -   Sincronização offline-first robusta para todos os dados de treino.
    -   **Modelo de Exercícios Flexível:** Suporte para exercícios de força (séries, repetições, peso, descanso) e cardio (duração em minutos).
-   **Tela de Detalhes do Treino:** Exibe a lista de exercícios de um treino específico, com opções para iniciar, editar ou excluir o treino.
-   **Execução de Treino:** Interface para registrar séries, repetições, peso e descansos durante um treino de força, e controle de tempo para treinos de cardio. Inclui cronômetro de descanso.

---

## 🗺️ Roadmap (Funcionalidades Futuras)

-   [x] **Gerenciamento Completo de Treinos:** (Concluído em 30/10/2025)
    -   [x] Criação, leitura, atualização e exclusão (CRUD) de treinos e exercícios.
    -   [x] Sincronização offline-first para todos os dados de treino.
-   [x] **Execução de Treino:** (Concluído em 30/10/2025)
    -   [x] Interface para registrar séries, repetições, peso e descansos durante um treino.
    -   [x] Cronômetro de descanso.
-   [ ] **Biblioteca de Exercícios:**
    -   [ ] Uma lista de exercícios pesquisável com instruções e GIFs/vídeos.
-   [ ] **Dashboard e Estatísticas:**
    -   [ ] Gráficos para visualizar o progresso de volume, peso levantado, etc.
    -   [ ] Histórico de treinos concluídos.
-   [ ] **Notificações:**
    -   [ ] Lembretes para dias de treino.

---

## 🔧 Stack Tecnológica

-   **Framework:** React Native com Expo (Managed Workflow)
-   **Linguagem:** TypeScript
-   **Navegação:** React Navigation
-   **Gerenciamento de Estado:** Zustand (para estado global)
-   **Banco de Dados Local:** Expo-SQLite
-   **Backend & Autenticação:** Firebase (Auth e Firestore)
-   **Qualidade de Código:** ESLint, Prettier, Husky, Conventional Commits

---

## 🚀 Como Começar

### Pré-requisitos

-   Node.js (versão LTS)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/)
-   Uma conta do Firebase com um projeto criado.

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/IronFlow.git
    cd IronFlow
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Firebase:**
    -   Renomeie o arquivo `.env.example` para `.env`.
    -   Abra o arquivo `.env` e preencha com as credenciais do seu projeto Firebase. Você pode encontrá-las nas configurações do seu projeto no console do Firebase.
    ```
    EXPO_PUBLIC_FIREBASE_API_KEY="SUA_API_KEY"
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
    EXPO_PUBLIC_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="SEU_SENDER_ID"
    EXPO_PUBLIC_FIREBASE_APP_ID="SEU_APP_ID"
    ```

4.  **Execute o aplicativo:**
    ```bash
    npx expo start
    ```
    Use o Expo Go no seu celular para escanear o QR code ou execute em um emulador.

---

## 📂 Estrutura do Projeto

```
/
├── src/
│   ├── components/   # Componentes de UI reutilizáveis
│   ├── config/       # Configuração de serviços (Firebase)
│   ├── db/           # Lógica do banco de dados local (SQLite)
│   ├── hooks/        # Hooks customizados (useAuth, useUserProfile, etc.)
│   ├── navigation/   # Stacks de navegação e tipos
│   ├── screens/      # Telas do aplicativo, organizadas por fluxo
│   ├── state/        # Stores globais (Zustand)
│   ├── sync/         # Lógica do motor de sincronização
│   ├── theme/        # Sistema de design (cores, fontes, espaçamento)
│   ├── types/        # Definições de tipo globais (TypeScript)
│   └── utils/        # Funções utilitárias puras (cálculos, conversões)
└── ...
```

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Por favor, siga estes passos:

1.  Faça um "Fork" do projeto.
2.  Crie uma nova branch (`git checkout -b feature/nova-feature`).
3.  Faça suas alterações e commite-as seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/).
4.  Faça um "Push" para a sua branch (`git push origin feature/nova-feature`).
5.  Abra um "Pull Request".
