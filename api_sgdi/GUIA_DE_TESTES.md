# 📚 Guia Prático de Testes da API REST SGDI

Este documento reúne todos os comandos `cURL` prontos para você testar e integrar a API REST do **SGDI (Sistema de Gestão de Demandas de TI)**.

---

## ⚙️ 1. Configuração e Variáveis Rápidas

Para facilitar os testes no seu terminal (evitando digitar a chave e URL toda vez), execute no terminal:

```bash
export URL_BASE="http://localhost:3001"
export API_KEY="sgdi_secret_token_integracao_externa_2026"
```

> [!NOTE]
> * **Porta padrão da API:** `3001`
> * **Autenticação:** Aceita tanto o cabeçalho `X-API-Key: <chave>` quanto `Authorization: Bearer <chave>`.
> * As rotas de negócio iniciam obrigatoriamente com o prefixo `/api/`.

---

## 🩺 2. Diagnóstico, Status e Documentação (Rotas Públicas)

Essas rotas não exigem chave de autenticação e servem para healthcheck, monitoramento externo e documentação técnica.

### 2.1 Metadados da API (Raiz)
```bash
curl -X GET "$URL_BASE/"
```
> **Explicação do comando:**
> Retorna um JSON identificador do serviço com links rápidos para a documentação, healthcheck e especificação OpenAPI.

---

### 2.2 Healthcheck e Uptime do Servidor
```bash
curl -X GET "$URL_BASE/api/status"
```
> **Explicação do comando:**
> Retorna se a API está `operacional`, o tempo de atividade em segundos (`uptime_segundos`) e timestamp atual. Ideal para Kubernetes Liveness Probe e monitoramentos de uptime.

---

### 2.3 Obter a Especificação OpenAPI 3.0 em JSON puro
```bash
curl -X GET "$URL_BASE/api/docs/openapi.json"
```
> **Explicação do comando:**
> Retorna a especificação OpenAPI 3.0 completa em JSON. Você pode importar este link diretamente no **Postman**, **Insomnia** ou **Swagger UI**.

---

## 👥 3. Gestão de Usuários e Membros (`/api/usuarios`)

Gerencia solicitantes, técnicos e administradores do SGDI.

### 3.1 Listar todos os usuários cadastrados
```bash
curl -X GET "$URL_BASE/api/usuarios" \
  -H "X-API-Key: $API_KEY"
```

---

### 3.2 Filtrar usuários por função ou status
```bash
curl -X GET "$URL_BASE/api/usuarios?status=active&funcao=Membro" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação dos parâmetros de filtro:**
> * `status`: Estado do usuário no sistema (ex: `active`, `pending`, `removed`).
> * `funcao`: Nível do membro (ex: `Membro`, `Administrador`, `Proprietário`).

---

### 3.3 Buscar usuário por termo (Nome ou E-mail)
```bash
curl -X GET "$URL_BASE/api/usuarios?busca=Luiz" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Realiza busca textual parcial sem distinção entre maiúsculas e minúsculas no nome e no e-mail do usuário.

---

### 3.4 Consultar um usuário específico pelo ID
```bash
curl -X GET "$URL_BASE/api/usuarios/31" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Substitua `31` pelo ID sequencial desejado. Se o ID não existir, a API responderá com HTTP `404 Not Found`.

---

### 3.5 Cadastrar um novo usuário / membro
```bash
curl -X POST "$URL_BASE/api/usuarios" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Carlos Eduardo Silva",
    "email": "carlos.silva@empresa.com",
    "funcao": "Membro",
    "status": "active"
  }'
```
> 📋 **Explicação detalhada dos campos:**
> | Campo | Tipo | Obrigatório | Descrição / Regra |
> |---|---|:---:|---|
> | `nome_completo` | String | **Sim** | Nome e sobrenome do membro. |
> | `email` | String | **Sim** | E-mail corporativo válido (deve conter `@`). |
> | `funcao` | String | Não | Cargo/função. Padrão: `"Membro"`. |
> | `status` | String | Não | Situação: `"active"` (padrão) ou `"pending"`. |
> | `iniciais` | String | Não | Se omitido, a API calcula automaticamente (ex: "Carlos Silva" vira `"CS"`). |
> | `url_avatar` | String | Não | URL pública para a imagem de avatar do perfil. |

---

## 📌 4. Gestão de Demandas / Tarefas (`/api/demandas`)

Permite a aplicações externas consultar, criar e gerenciar o ciclo de vida dos chamados e cartões do Kanban.

### 4.1 Listar demandas com paginação
```bash
curl -X GET "$URL_BASE/api/demandas?pagina=1&limite=5" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> * `pagina`: Número da página (padrão: `1`).
> * `limite`: Quantidade de itens por página (padrão: `50`, máx: `100`).
> * O objeto `meta` da resposta informa o `total` de registros e `total_paginas`.

---

### 4.2 Filtrar demandas por Coluna / Status do Kanban
```bash
curl -X GET "$URL_BASE/api/demandas?status=in-progress" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação das colunas aceitas:**
> * `todo`: A Fazer / Pendente de início.
> * `in-progress`: Em Andamento / Em desenvolvimento.
> * `done`: Concluído / Finalizado.

---

### 4.3 Filtrar demandas por Prioridade
```bash
curl -X GET "$URL_BASE/api/demandas?prioridade=high" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação dos níveis de prioridade:**
> * `low`: Prioridade Baixa.
> * `medium`: Prioridade Média (padrão).
> * `high`: Prioridade Alta / Urgente.

---

### 4.4 Filtrar demandas por Responsável
```bash
curl -X GET "$URL_BASE/api/demandas?responsavel_id=31" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Retorna todas as demandas em que o usuário com ID `31` está incluído na lista de responsáveis (`ids_responsaveis`).

---

### 4.5 Buscar demandas por palavra-chave
```bash
curl -X GET "$URL_BASE/api/demandas?busca=Kubernetes" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Procura o termo no título e na descrição das demandas.

---

### 4.6 Obter detalhes de uma demanda específica por ID
```bash
curl -X GET "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Retorna todos os dados da demanda `#42`. Se não existir, retorna HTTP `404`.

---

### 4.7 Criar uma nova demanda
```bash
curl -X POST "$URL_BASE/api/demandas" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Implementar Backup Automatizado do PostgreSQL",
    "descricao": "Configurar rotina diária de dump para bucket S3 com criptografia KMS.",
    "coluna": "todo",
    "prioridade": "high",
    "data_vencimento": "2026-12-20",
    "id_usuario": "a7dff8fc-60f0-4a86-82b9-1c6092f25415",
    "ids_responsaveis": ["31", "32"]
  }'
```
> 📋 **Explicação detalhada dos campos:**
> | Campo | Tipo | Obrigatório | Descrição / Valores válidos |
> |---|---|:---:|---|
> | `titulo` | String | **Sim** | Título claro e objetivo da demanda (não pode ser vazio). |
> | `descricao` | String | Não | Detalhamento técnico da tarefa. |
> | `coluna` | String | Não | Status inicial: `'todo'`, `'in-progress'` ou `'done'`. Padrão: `'todo'`. |
> | `prioridade` | String | Não | Urgência: `'low'`, `'medium'` ou `'high'`. Padrão: `'medium'`. |
> | `data_vencimento` | String | Não | Prazo limite no formato ISO `YYYY-MM-DD` (ex: `"2026-12-20"`). |
> | `id_usuario` | String | Não | UUID do usuário solicitante (opcional). |
> | `ids_responsaveis`| Array | Não | Lista de IDs dos membros designados (ex: `["31", "32"]`). |

---

### 4.8 Editar apenas a Coluna (Mover Status no Kanban) com PATCH
```bash
curl -X PATCH "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "coluna": "in-progress"
  }'
```
> ✏️ **Explicação específica deste comando:**
> * O método **`PATCH`** realiza uma **atualização parcial**.
> * Você envia **somente** o campo que deseja alterar. Todos os outros dados (título, descrição, prioridade, responsáveis) permanecem intactos.
> * Valores aceitos para mover: `"todo"`, `"in-progress"`, `"done"`.

---

### 4.9 Editar apenas a Prioridade e o Prazo com PATCH
```bash
curl -X PATCH "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prioridade": "high",
    "data_vencimento": "2026-11-30"
  }'
```
> ✏️ **Explicação específica deste comando:**
> * Altera apenas o nível de criticidade e a data limite de entrega da demanda `#42`.
> * `prioridade` aceita: `"low"`, `"medium"`, `"high"`.
> * `data_vencimento` deve seguir o formato `YYYY-MM-DD`.

---

### 4.10 Reatribuir Responsáveis com PATCH
```bash
curl -X PATCH "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ids_responsaveis": ["1", "31"]
  }'
```
> ✏️ **Explicação específica deste comando:**
> * Substitui a lista de responsáveis da demanda `#42` pelos membros com IDs `1` e `31`.
> * Para remover todos os responsáveis, passe um array vazio: `"ids_responsaveis": []`.

---

### 4.11 Atualizar demanda completa com PUT
```bash
curl -X PUT "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Migração do Cluster Kubernetes Concluída",
    "descricao": "Versão 1.30 estável em produção.",
    "coluna": "done",
    "prioridade": "medium",
    "data_vencimento": "2026-10-02"
  }'
```
> ✏️ **Explicação:**
> O método **`PUT`** atualiza o conjunto de campos da demanda `#42`.

---

### 4.12 Excluir uma demanda (DELETE)
```bash
curl -X DELETE "$URL_BASE/api/demandas/42" \
  -H "X-API-Key: $API_KEY"
```
> ⚠️ **Explicação específica deste comando:**
> * Remove permanentemente a demanda `#42` do sistema.
> * Retorna status `200 OK` com a confirmação: `{"sucesso": true, "mensagem": "Demanda #42 excluída com sucesso."}`.
> * Se você executar novamente o comando no mesmo ID, a API responderá com status `404 Not Found`.

---

## 💬 5. Comentários da Demanda (`/api/demandas/:id/comentarios`)

Registra o histórico de anotações, homologações e updates da demanda.

### 5.1 Listar todos os comentários de uma demanda
```bash
curl -X GET "$URL_BASE/api/demandas/42/comentarios" \
  -H "X-API-Key: $API_KEY"
```
> 🔍 **Explicação:**
> Retorna a linha do tempo de comentários vinculados ao cartão `#42`, ordenados cronologicamente.

---

### 5.2 Adicionar um novo comentário na demanda
```bash
curl -X POST "$URL_BASE/api/demandas/42/comentarios" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id_autor": 31,
    "conteudo": "Janela de manutenção executada com sucesso. Todos os pods estão saudáveis."
  }'
```
> 📋 **Explicação detalhada dos campos:**
> | Campo | Tipo | Obrigatório | Descrição |
> |---|---|:---:|---|
> | `id_autor` | Número ou String | **Sim** | ID do membro autor do comentário (ex: `31`). |
> | `conteudo` | String | **Sim** | Texto do comentário (não pode ser vazio). |

---

## 🔒 6. Testes de Segurança e Códigos de Erro Semânticos

Esses testes validam que a API é confiável, segura e rejeita requisições impróprias com os códigos HTTP corretos.

### 6.1 Testar falta de chave de autenticação (Esperado: 401 Unauthorized)
```bash
curl -X GET "$URL_BASE/api/demandas"
```
> 🛑 **Resposta esperada (HTTP 401):**
> ```json
> {
>   "sucesso": false,
>   "erro": "Não autorizado",
>   "mensagem": "Chave de autenticação ausente. Forneça a chave no cabeçalho 'X-API-Key' ou 'Authorization: Bearer <chave>'.",
>   "codigo_status": 401
> }
> ```

---

### 6.2 Testar chave inválida (Esperado: 401 Unauthorized)
```bash
curl -X GET "$URL_BASE/api/demandas" \
  -H "X-API-Key: chave_totalmente_errada_123"
```
> 🛑 **Resposta esperada (HTTP 401):**
> Retorna `401 Unauthorized` informando chave inválida e acesso negado.

---

### 6.3 Testar criação de demanda sem título (Esperado: 400 Bad Request)
```bash
curl -X POST "$URL_BASE/api/demandas" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Faltou o campo título"
  }'
```
> 🛑 **Resposta esperada (HTTP 400):**
> ```json
> {
>   "sucesso": false,
>   "erro": "Dados inválidos",
>   "mensagem": "O campo 'titulo' é obrigatório e deve ser uma string não vazia.",
>   "codigo_status": 400
> }
> ```

---

### 6.4 Testar coluna inválida (Esperado: 400 Bad Request)
```bash
curl -X POST "$URL_BASE/api/demandas" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste de Coluna",
    "coluna": "coluna_que_nao_existe"
  }'
```
> 🛑 **Resposta esperada (HTTP 400):**
> Mensagem informando que `coluna` só aceita `'todo'`, `'in-progress'` ou `'done'`.

---

### 6.5 Testar envio de JSON quebrado / malformatado (Esperado: 400 Bad Request)
```bash
curl -X POST "$URL_BASE/api/demandas" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Quebrado", '
```
> 🛑 **Resposta esperada (HTTP 400):**
> O middleware de proteção intercepta a falha de sintaxe e responde em JSON padronizado com `"erro": "JSON Inválido"`, sem derrubar o servidor.

---

### 6.6 Testar rota inexistente (Esperado: 404 Not Found)
```bash
curl -X GET "$URL_BASE/api/rota-que-nao-existe"
```
> 🛑 **Resposta esperada (HTTP 404):**
> ```json
> {
>   "sucesso": false,
>   "erro": "Rota não encontrada",
>   "mensagem": "O caminho 'GET /api/rota-que-nao-existe' não existe na API SGDI. Consulte a documentação em /api/docs",
>   "codigo_status": 404
> }
> ```

---

## 🚀 7. Testes Automatizados via Terminal

Para validar todos esses fluxos automaticamente com um único comando:

```bash
# Na pasta api_sgdi:
npm test

# Ou na raiz Sistema_SGDI:
npm run api:test
```
Todos os 16 testes de ciclo de vida, integridade de status e validação de autenticação são executados e exibem o relatório no terminal.

