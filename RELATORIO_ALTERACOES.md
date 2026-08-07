# Relatorio de Alteracoes e Problemas Identificados

## Projeto

SGDI - Sistema de Gestao de Demandas Internas

## Objetivo do documento

Este documento lista os problemas encontrados no projeto, as alteracoes realizadas para corrigir esses problemas e o status final dos testes executados.

## Arquivos alterados

### 1. app.py

O arquivo `app.py` e o arquivo principal da aplicacao Flask. Nele foram feitas as principais correcoes para permitir que o sistema inicialize corretamente e funcione com mais seguranca.

#### Alteracoes realizadas

- Corrigido o import do Flask.

Antes:

```python
from Flask import Flask, render_template, request, redirect, url_for, flash
```

Depois:

```python
from flask import Flask, abort, render_template, request, redirect, url_for, flash
```

- Adicionado o uso de `abort(404)` para retornar erro 404 quando uma demanda nao for encontrada.

- Alteradas as rotas que recebem identificadores para aceitar apenas numeros inteiros.

Exemplos:

```python
@app.route('/editar/<int:id>', methods=['GET', 'POST'])
@app.route('/deletar/<int:id>')
@app.route('/detalhes/<int:id>')
@app.route('/adicionar_comentario/<int:demanda_id>', methods=['POST'])
```

- Substituidos comandos SQL montados com `f-string` por comandos SQL parametrizados.

Antes:

```python
cursor.execute(f"SELECT * FROM demandas WHERE id={id}")
```

Depois:

```python
cursor.execute("SELECT * FROM demandas WHERE id = ?", (id,))
```

- Corrigidas as operacoes de:
  - criar demanda;
  - editar demanda;
  - deletar demanda;
  - buscar demanda;
  - visualizar detalhes;
  - adicionar comentario.

#### Problemas que existiam no app.py

1. O import estava incorreto.

O projeto usava `from Flask import ...`, mas em Python o nome correto do pacote e `flask`, com letra minuscula.

Erro apresentado:

```text
ModuleNotFoundError: No module named 'Flask'
```

2. As consultas SQL eram montadas diretamente com valores do usuario.

Isso podia causar:

- erro quando o usuario digitasse aspas ou apostrofos;
- falhas em buscas e cadastros;
- vulnerabilidade a SQL Injection.

3. As rotas aceitavam qualquer texto no lugar do ID.

Por exemplo, uma rota como `/detalhes/teste` poderia tentar executar uma consulta invalida no banco.

4. Quando uma demanda nao existia, o sistema nao tratava corretamente esse caso.

Agora, nesses casos, o sistema retorna erro 404.

## 2. requirements.txt

O arquivo `requirements.txt` lista as dependencias necessarias para executar o projeto.

#### Alteracoes realizadas

Antes:

```txt
Flask==2.3.0
```

Depois:

```txt
Flask==2.3.0
Werkzeug<3
```

#### Problema que existia no requirements.txt

O Flask 2.3.0 apresentou incompatibilidade com versoes mais novas do Werkzeug.

Erro apresentado:

```text
AttributeError: module 'werkzeug' has no attribute '__version__'
```

Isso aconteceu porque o `Werkzeug 3` removeu um atributo que o `Flask 2.3.0` ainda tentava acessar durante os testes.

Para resolver, foi adicionada a restricao:

```txt
Werkzeug<3
```

Com isso, foi instalada uma versao compativel do Werkzeug.

## 3. init_db.py

O arquivo `init_db.py` e responsavel por criar e atualizar o banco de dados SQLite do projeto.

#### Alteracoes realizadas

- O arquivo foi reestruturado.

- A tabela `demandas` passou a ser criada com `id` correto:

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

- A tabela `comentarios` tambem passou a usar `id` como chave primaria autoincrementavel.

- Foi adicionada chave estrangeira para relacionar comentarios com demandas:

```sql
FOREIGN KEY (demanda_id) REFERENCES demandas (id)
```

- Foi criada uma migracao para corrigir bancos antigos que ja tinham sido criados com estrutura incorreta.

- Foi usado `INSERT OR IGNORE` para evitar duplicacao de dados ao rodar o arquivo mais de uma vez.

- Foi removido da carga inicial o comentario orfao que apontava para uma demanda inexistente.

#### Problemas que existiam no init_db.py

1. O campo `id` da tabela `demandas` nao era chave primaria.

Antes, a tabela era criada com:

```sql
id INTEGER
```

Isso fazia com que novas demandas fossem cadastradas com `id = NULL`.

Consequencia:

- links de detalhes poderiam ficar incorretos;
- edicao e exclusao poderiam falhar;
- o sistema poderia gerar rotas invalidas, como `/detalhes/None`.

2. O campo `id` da tabela `comentarios` tambem nao era chave primaria.

Isso deixava a estrutura do banco inconsistente.

3. Existia um comentario associado a uma demanda inexistente.

O dado antigo apontava para `demanda_id = 99`, mas nao existia demanda com esse ID.

Isso caracterizava um comentario orfao.

4. O script podia inserir dados duplicados.

Ao rodar `python init_db.py` mais de uma vez, os mesmos registros poderiam ser inseridos novamente.

Agora isso foi evitado com `INSERT OR IGNORE`.

## 4. demandas.db

O arquivo `demandas.db` foi criado ou atualizado ao executar:

```bash
python init_db.py
```

Durante os testes, tambem foram criadas demandas de teste para validar o funcionamento do cadastro.

Exemplos:

- `Teste`
- `Teste final`

## Problemas gerais encontrados no projeto

### 1. O app nao iniciava

O primeiro erro encontrado foi:

```text
ModuleNotFoundError: No module named 'Flask'
```

Causa:

O import estava escrito com letra maiuscula.

Correcao:

```python
from flask import Flask
```

### 2. O Flask nao estava instalado

Depois de corrigir o import, apareceu:

```text
ModuleNotFoundError: No module named 'flask'
```

Causa:

As dependencias do projeto ainda nao tinham sido instaladas.

Correcao:

```bash
python -m pip install -r requirements.txt
```

### 3. Incompatibilidade entre Flask e Werkzeug

Erro encontrado:

```text
AttributeError: module 'werkzeug' has no attribute '__version__'
```

Causa:

O Flask 2.3.0 estava usando uma versao incompatvel do Werkzeug.

Correcao:

```txt
Werkzeug<3
```

### 4. Banco de dados inexistente

O arquivo `demandas.db` nao existia inicialmente.

Correcao:

```bash
python init_db.py
```

### 5. Novas demandas ficavam sem ID

O banco antigo nao tinha `id` como chave primaria autoincrementavel.

Consequencia:

Novas demandas eram gravadas com `id = NULL`.

Correcao:

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

### 6. SQL inseguro

O sistema montava SQL diretamente com dados recebidos do formulario.

Exemplo de problema:

```python
f"SELECT * FROM demandas WHERE titulo LIKE '%{termo}%'"
```

Correcao:

```python
cursor.execute(
    "SELECT * FROM demandas WHERE titulo LIKE ?",
    (f"%{termo}%",),
)
```

### 7. Dados inconsistentes no banco

Existia comentario apontando para uma demanda inexistente.

Correcao:

O script de banco foi ajustado para criar relacionamento correto entre `comentarios` e `demandas`.

## Testes executados

Foram testadas as principais rotas do sistema:

```text
/ 200
/nova_demanda 200
/detalhes/1 200
/editar/1 200
/buscar?q=bug 200
POST /nova_demanda 302 /
```

## Resultado final

O projeto passou a iniciar corretamente com:

```bash
python app.py
```

O servidor Flask fica disponivel em:

```text
http://127.0.0.1:5000
```

## Comandos para executar o projeto

Instalar dependencias:

```bash
python -m pip install -r requirements.txt
```

Criar ou atualizar o banco de dados:

```bash
python init_db.py
```

Iniciar o sistema:

```bash
python app.py
```

## Conclusao

Os principais problemas do projeto estavam relacionados a import incorreto, dependencias ausentes ou incompativeis, estrutura incorreta do banco de dados e consultas SQL inseguras.

Com as alteracoes realizadas, o sistema passou a iniciar, acessar as rotas principais e cadastrar demandas corretamente.
