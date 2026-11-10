# 🚀 API REST SGDI - Sistema de Gestão de Demandas de TI

API REST oficial projetada para permitir que **aplicações e sistemas externos consultem e manipulem os dados do SGDI** (Sistema de Gestão de Demandas de TI) de forma padronizada, segura e documentada.

---

## 📋 Checklist de Conformidade da API

| Item do Checklist | Status | Implementação |
|---|---|---|
| **Rotas começam com `/api/`** | ✅ Conforme | Todas as rotas estão sob o prefixo `/api/` (`/api/status`, `/api/demandas`, `/api/usuarios`, etc.) |
| **Rotas protegidas exigem a chave** | ✅ Conforme | Middleware `autenticarApiKey` valida o cabeçalho `X-API-Key` ou `Authorization: Bearer <chave>` |
| **Sem chave, a resposta é 401** | ✅ Conforme | Responde com HTTP `401 Unauthorized` e mensagem descritiva em JSON |
| **Cada rota usa o verbo certo** | ✅ Conforme | `GET` (consultas), `POST` (criações), `PUT`/`PATCH` (atualizações), `DELETE` (exclusões) |
| **Sempre responde em JSON** | ✅ Conforme | Todas as rotas, inclusive erros 400, 401, 404 e 500, respondem com cabeçalho `application/json; charset=utf-8` |
| **Chave fora do código (variável de ambiente)** | ✅ Conforme | Configurada via arquivo `.env` com a variável `API_KEY` (com modelo em `.env.example`) |
| **Código certo: 200, 201, 400, 404...** | ✅ Conforme | Códigos de status HTTP rigorosamente semânticos |
| **Toda rota documentada e testada** | ✅ Conforme | Documentação interativa via **Swagger UI** (`/api/docs`), especificação OpenAPI 3.0 (`/api/docs/openapi.json`) e suíte completa com **16 testes automatizados** via Vitest |

---

## 🛠️ Tecnologias Utilizadas

- **Runtime**: Node.js (v22+)
- **Linguagem**: TypeScript (Strict Mode)
- **Framework Web**: Express.js
- **Segurança**: Middleware de API Key, CORS configurável, sanitização
- **Persistência**: Integração com **Supabase (PostgreSQL)** e fallback resiliente em memória
- **Documentação**: Swagger UI Express e OpenAPI 3.0.3
- **Testes Automatizados**: Vitest e Supertest

---

## 📂 Estrutura de Diretórios

```
api_sgdi/
├── .env                  # Variáveis de ambiente locais (não versionadas)
├── .env.example          # Exemplo de configuração das variáveis
├── .gitignore            # Arquivos ignorados pelo controle de versão
├── README.md             # Esta documentação completa
├── package.json          # Dependências e scripts do projeto
├── tsconfig.json         # Configurações do compilador TypeScript
├── vitest.config.ts      # Configurações da suíte de testes Vitest
├── src/
│   ├── app.ts            # Configuração e inicialização da aplicação Express
│   ├── servidor.ts       # Ponto de entrada (escuta na porta HTTP)
│   ├── config/
│   │   └── env.ts        # Leitura e validação das variáveis de ambiente
│   ├── controladores/
│   │   ├── demandas.controlador.ts # Manipulação de requisições de demandas e comentários
│   │   ├── status.controlador.ts   # Healthcheck e status do sistema
│   │   └── usuarios.controlador.ts # Manipulação de requisições de usuários/membros
│   ├── docs/
│   │   └── swagger.ts    # Especificação formal OpenAPI 3.0.3
│   ├── middlewares/
│   │   ├── autenticacao.ts         # Validação de API Key (HTTP 401)
│   │   ├── formatador-json.ts      # Força Content-Type application/json
│   │   └── manipulador-erros.ts    # Tratamento global de erros e rotas 404
│   ├── rotas/
│   │   ├── index.ts          # Centralizador de rotas com prefixo /api/
│   │   ├── demandas.rotas.ts # Endpoints de demandas e comentários
│   │   ├── docs.rotas.ts     # Interface Swagger UI e spec OpenAPI
│   │   ├── status.rotas.ts   # Endpoint de status operacional
│   │   └── usuarios.rotas.ts # Endpoints de membros/usuários
│   ├── servicos/
│   │   ├── demandas.servico.ts # Regras de negócio e persistência de demandas
│   │   ├── supabase.servico.ts # Cliente oficial de banco Supabase
│   │   └── usuarios.servico.ts # Regras de negócio e persistência de usuários
│   └── tipos/
│       └── index.ts          # Definições de tipos e DTOs TypeScript
└── testes/
    ├── checklist-api.test.ts # Testes automatizados do Checklist da API
    ├── demandas.test.ts      # Testes do ciclo de vida das demandas e comentários
    └── usuarios.test.ts      # Testes de consulta e cadastro de usuários
```

---

## 🔐 Autenticação

As rotas da API que manipulam dados exigem autenticação através de uma **Chave de API (API Key)**.

A chave pode ser enviada por aplicações externas de duas formas:

1. **Cabeçalho `X-API-Key`**:
   ```http
   X-API-Key: sgdi_secret_token_integracao_externa_2026
   ```

2. **Cabeçalho `Authorization` (Bearer Token)**:
   ```http
   Authorization: Bearer sgdi_secret_token_integracao_externa_2026
   ```

### Resposta em caso de ausência ou chave inválida (401 Unauthorized):
```json
{
  "sucesso": false,
  "erro": "Não autorizado",
  "mensagem": "Chave de autenticação ausente. Forneça a chave no cabeçalho 'X-API-Key' ou 'Authorization: Bearer <chave>'.",
  "codigo_status": 401
}
```

---

## 🌐 Endpoints Disponíveis

Todas as rotas iniciam obrigatoriamente com o prefixo `/api/`.

### 1. Diagnóstico, Metadados e Documentação (Públicos)
| Método | Rota | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/` ou `/api` | Metadados do serviço e links da API em JSON | `200 OK` |
| `GET` | `/api/status` | Retorna o estado operacional e uptime da API | `200 OK` |
| `GET` | `/api/docs` | Interface gráfica de documentação Swagger UI | `200 OK` |
| `GET` | `/api/docs/openapi.json` | Especificação completa no padrão OpenAPI 3.0 em JSON | `200 OK` |

### 2. Gestão de Demandas / Tarefas (Protegidos)
| Método | Rota | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/api/demandas` | Lista todas as demandas (com filtros por `status`, `prioridade`, `busca`, paginação) | `200 OK` |
| `GET` | `/api/demandas/:id` | Retorna os detalhes de uma demanda específica | `200 OK` |
| `POST` | `/api/demandas` | Cadastra uma nova demanda no SGDI | `201 Created` |
| `PUT` | `/api/demandas/:id` | Atualiza os dados de uma demanda existente | `200 OK` |
| `PATCH`| `/api/demandas/:id` | Atualiza parcialmente uma demanda (ex: mover coluna/status) | `200 OK` |
| `DELETE`| `/api/demandas/:id` | Remove uma demanda do sistema | `200 OK` |

### 3. Comentários da Demanda (Protegidos)
| Método | Rota | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/api/demandas/:id/comentarios` | Lista os comentários vinculados à demanda | `200 OK` |
| `POST`| `/api/demandas/:id/comentarios` | Insere um comentário na demanda | `201 Created` |

### 4. Membros e Solicitantes (Protegidos)
| Método | Rota | Descrição | Status Sucesso |
|---|---|---|---|
| `GET` | `/api/usuarios` | Lista os membros e solicitantes cadastrados | `200 OK` |
| `GET` | `/api/usuarios/:id` | Retorna informações de um usuário específico | `200 OK` |
| `POST`| `/api/usuarios` | Cadastra um novo membro no sistema | `201 Created` |

---

## 🚦 Códigos de Status HTTP

| Código | Nome | Quando é retornado |
|---|---|---|
| **200** | `OK` | Requisição processada com sucesso (`GET`, `PUT`, `PATCH`, `DELETE`) |
| **201** | `Created` | Novo recurso criado com sucesso no banco (`POST`) |
| **400** | `Bad Request` | Erro de validação nos dados enviados (ex: campo obrigatório ausente, JSON inválido) |
| **401** | `Unauthorized` | Chave de API ausente ou inválida |
| **404** | `Not Found` | Recurso não localizado (ex: ID inexistente ou rota não mapeada) |
| **500** | `Internal Server Error` | Erro interno não tratado no servidor |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (recomendado Node.js 20 ou 22)
- npm 9+

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar as variáveis de ambiente
Copie o arquivo de exemplo para `.env`:
```bash
cp .env.example .env
```
Abra o arquivo `.env` e configure sua chave de API desejada:
```env
PORT=3001
API_KEY=sgdi_secret_token_integracao_externa_2026
SUPABASE_URL=https://ddwlkvpvyzwkmmhpvcqn.supabase.co
SUPABASE_KEY=sua-chave-aqui
```

### 3. Iniciar o servidor em desenvolvimento (Hot-reload)
```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3001/api`  
Documentação interativa Swagger: `http://localhost:3001/api/docs`

### 4. Executar os Testes Automatizados
```bash
npm test
```

---

## 📡 Exemplos Práticos de Integração (cURL)

### 1. Consultar status da API (Healthcheck - Pública)
```bash
curl -X GET http://localhost:3001/api/status
```

### 2. Listar demandas (com chave de API)
```bash
curl -X GET http://localhost:3001/api/demandas \
  -H "X-API-Key: sgdi_secret_token_integracao_externa_2026"
```

### 3. Criar uma nova demanda
```bash
curl -X POST http://localhost:3001/api/demandas \
  -H "X-API-Key: sgdi_secret_token_integracao_externa_2026" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Implementar Webhook de Notificações",
    "descricao": "Enviar eventos HTTP quando um cartão mudar de status.",
    "coluna": "todo",
    "prioridade": "high",
    "data_vencimento": "2026-12-15"
  }'
```

### 4. Atualizar o status da demanda para "in-progress"
```bash
curl -X PUT http://localhost:3001/api/demandas/42 \
  -H "X-API-Key: sgdi_secret_token_integracao_externa_2026" \
  -H "Content-Type: application/json" \
  -d '{
    "coluna": "in-progress"
  }'
```

### 5. Adicionar comentário na demanda
```bash
curl -X POST http://localhost:3001/api/demandas/42/comentarios \
  -H "X-API-Key: sgdi_secret_token_integracao_externa_2026" \
  -H "Content-Type: application/json" \
  -d '{
    "id_autor": 31,
    "conteudo": "Iniciando a homologação em ambiente de testes."
  }'
```

### 6. Excluir uma demanda
```bash
curl -X DELETE http://localhost:3001/api/demandas/42 \
  -H "X-API-Key: sgdi_secret_token_integracao_externa_2026"
```

---

## 🔒 Segurança e Boas Práticas

- **Sem Hardcoded Secrets**: A chave de API nunca deve ser salva no código-fonte nem em repositórios Git. O arquivo `.env` está explicitamente incluído no `.gitignore`.
- **Content-Type Estrito**: Middleware intercepta e assegura que nenhuma resposta seja enviada sem o cabeçalho JSON.
- **Fail-Safe**: A API possui resiliência com dados padrão para operar sem interrupções caso o banco remoto passe por instabilidade temporária.
