# SGDI - Sistema de Gestão de Demandas de TI

Sistema web para gerenciamento de tarefas, demandas e projetos de equipes de Tecnologia da Informação

---

## 🚀 Tecnologias e Stacks Utilizadas

### Front-end
- **React 18** (com TypeScript)
- **Vite** (Build tool e servidor de desenvolvimento ultrarrápido)
- **React Router DOM v6** (Roteamento SPA de alta performance)
- **CSS** (Design system com suporte a Dark Mode e temas dinâmicos)
- **Radix UI** (Componentes acessíveis e headless: Dialogs, Popovers, Selects, Dropdowns, etc.)
- **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) (Arrastar e soltar suave no Kanban)
- **@tanstack/react-query v5** (Gerenciamento de estado assíncrono, cache e sincronização)
- **Tabler Icons & Lucide React** (Ícones modernos e consistentes)
- **Date-fns** (Manipulação e formatação internacionalizada de datas em pt-BR)
- **Sonner** (Notificações toast elegantes)

### Back-end & Infraestrutura
- **Supabase**
  - **Supabase Auth**: Autenticação por e-mail/senha e OAuth (Google)
  - **PostgreSQL**: Banco de dados relacional com Row Level Security (RLS)
  - **Storage**: Armazenamento de avatares e anexos

---

## 📂 Estrutura de Pastas do Projeto

```text
SGDI-ti/
├── public/                 # Recursos estáticos
├── src/
│   ├── componentes/        # Componentes reutilizáveis
│   │   ├── base/           # Botões, Badges, etc.
│   │   └── ui/             # Componentes de UI (Radix UI + Tailwind)
│   ├── dados/              # Constantes, tipos e dados iniciais
│   │   └── dados-iniciais.ts
│   ├── integracoes/        # Clientes e integrações externas
│   │   └── supabase/       # Cliente e configurações do Supabase
│   ├── lib/                # Provedores de contexto e utilitários
│   │   ├── autenticacao/   # Contexto e hooks de autenticação
│   │   ├── provedor-dados.tsx # Provedor de dados (React Query + Supabase)
│   │   └── utilitarios.ts  # Funções auxiliares (cn, etc.)
│   ├── paginas/            # Telas da aplicação
│   │   ├── autenticacao/   # Login, Cadastro, OAuth Callback
│   │   ├── configuracoes/  # Perfil, Senha, Membros da Equipe
│   │   └── quadro/         # Quadro Kanban, Lista e Detalhes do Cartão
│   ├── App.tsx             # Configuração de rotas e provedores globais
│   ├── index.css           # Estilos globais e tokens de cores
│   └── main.tsx            # Ponto de entrada da aplicação
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 📊 Status do Projeto: O que já tem vs. O que falta implementar

### ✅ Funcionalidades Já Implementadas e Funcionando

1. **Autenticação & Sessão Completa**
   - [x] Login com e-mail e senha integrado ao Supabase
   - [x] Cadastro de novos usuários
   - [x] Login social via Google OAuth
   - [x] Redirecionamento automático de rotas públicas/protegidas (`/auth` ↔ `/board`)
   - [x] Persistência de sessão de usuário

2. **Interface e Tema**
   - [x] Suporte nativo a Tema Claro, Tema Escuro e Automático (Sistema)
   - [x] Interface 100% responsiva (Desktop, Tablet e Mobile)
   - [x] Notificações toast em ações da aplicação

3. **Quadro Kanban & Visualização em Lista**
   - [x] Renderização de colunas (A Fazer, Em Andamento, Concluído)
   - [x] Arrastar e soltar cartões entre colunas e reordenação vertical (`@dnd-kit`)
   - [x] Alternância dinâmica entre modo Quadro (Kanban) e modo Lista
   - [x] Modal de Criação Rápida de Demandas ("Nova Demanda")
   - [x] Criação de cartões direto na coluna "A Fazer"
   - [x] Navegação completa para a página de detalhes da tarefa (`/board/:cardId`)

4. **Configurações & Gestão de Equipe**
   - [x] Atualização de perfil do usuário (nome completo e iniciais)
   - [x] Alteração de senha
   - [x] Listagem de membros ativos e convites pendentes
   - [x] Convite de novos membros por e-mail
   - [x] Alteração de função de membros (Administrador / Membro)
   - [x] Exclusão e revogação de membros/convites

---

### ⏳ Funcionalidades com Interface Pronta (Sem a implementação lógica)

As seguintes funcionalidades estão com **100% dos estilos, componentes visuais, botões e modais mantidos no front-end**, prontas para terem sua persistência e regras de negócio reativadas/conectadas:

1. **Comentários nas Demandas**
   - *Status atual:* Campo de texto, listagem visual e atalho `⌘ + Enter` disponíveis.
   - *Falta:* Persistir novos comentários e exclusão no banco de dados via Supabase.

2. **Atribuição de Usuário / Responsável no Cartão**
   - *Status atual:* Popover com busca e lista de membros da equipe com avatar funcional na interface.
   - *Falta:* Executar a mutação de atualização do campo `assignee_id` no card ao selecionar.

3. **Data de Vencimento / Prazo**
   - *Status atual:* Popover com calendário interativo e badges de alerta ("Vence hoje!", "Vencida há X dias").
   - *Falta:* Salvar a data selecionada no campo `due_date` do card via mutação.

4. **Checklists / Listas de Verificação**
   - *Status atual:* Interface de até 5 checklists por cartão, com cálculo dinâmico de porcentagem, barra de progresso, inclusão de itens e caixas de seleção.
   - *Falta:* Conectar a gravação dos itens e estados `is_completed` no backend.

5. **Descrição Detalhada do Cartão**
   - *Status atual:* Campo de área de texto expansível com estilos e placeholders.
   - *Falta:* Salvar o conteúdo digitado no campo `description` no evento `onBlur`/debounce.

6. **Paleta de Cores do Cartão**
   - *Status atual:* Seletor com 15 opções de cores, contraste automático e pré-visualização.
   - *Falta:* Salvar a cor selecionada no campo `color` do cartão.

7. **Exclusão de Cartões**
   - *Status atual:* Botões de exclusão no menu rápido e na página de detalhes com diálogo de confirmação (`AlertDialog`).
   - *Falta:* Disparar a mutação `useDeleteCard` na confirmação.

8. **Filtros da Barra de Ferramentas**
   - *Status atual:* Dropdowns de ordenação, filtro de prioridade, complexidade e campo de busca presentes e interativos.
   - *Falta:* Aplicar a filtragem no array de cartões do quadro.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **pnpm** / **yarn**

### 1. Clonar o repositório e instalar dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd SGDI-ti
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
npm run preview
```

---

