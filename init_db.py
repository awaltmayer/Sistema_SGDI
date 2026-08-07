import sqlite3


def table_exists(cursor, table_name):
    return cursor.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone() is not None


def id_is_primary_key(cursor, table_name):
    columns = cursor.execute(f"PRAGMA table_info({table_name})").fetchall()
    return any(column[1] == "id" and column[5] == 1 for column in columns)


def migrate_demandas(cursor):
    if not table_exists(cursor, "demandas") or id_is_primary_key(cursor, "demandas"):
        return

    cursor.execute("""
        CREATE TABLE demandas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            solicitante TEXT NOT NULL,
            data_criacao TEXT NOT NULL
        )
    """)
    cursor.execute("""
        INSERT OR IGNORE INTO demandas_new (id, titulo, descricao, solicitante, data_criacao)
        SELECT id, titulo, descricao, solicitante, data_criacao
        FROM demandas
        WHERE id IS NOT NULL
    """)
    cursor.execute("""
        INSERT INTO demandas_new (titulo, descricao, solicitante, data_criacao)
        SELECT titulo, descricao, solicitante, data_criacao
        FROM demandas
        WHERE id IS NULL
    """)
    cursor.execute("DROP TABLE demandas")
    cursor.execute("ALTER TABLE demandas_new RENAME TO demandas")


def migrate_comentarios(cursor):
    if not table_exists(cursor, "comentarios") or id_is_primary_key(cursor, "comentarios"):
        return

    cursor.execute("""
        CREATE TABLE comentarios_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demanda_id INTEGER NOT NULL,
            comentario TEXT NOT NULL,
            autor TEXT NOT NULL,
            data TEXT NOT NULL,
            FOREIGN KEY (demanda_id) REFERENCES demandas (id)
        )
    """)
    cursor.execute("""
        INSERT OR IGNORE INTO comentarios_new (id, demanda_id, comentario, autor, data)
        SELECT id, demanda_id, comentario, autor, data
        FROM comentarios
        WHERE id IS NOT NULL
        AND EXISTS (SELECT 1 FROM demandas WHERE demandas.id = comentarios.demanda_id)
    """)
    cursor.execute("""
        INSERT INTO comentarios_new (demanda_id, comentario, autor, data)
        SELECT demanda_id, comentario, autor, data
        FROM comentarios
        WHERE id IS NULL
        AND EXISTS (SELECT 1 FROM demandas WHERE demandas.id = comentarios.demanda_id)
    """)
    cursor.execute("DROP TABLE comentarios")
    cursor.execute("ALTER TABLE comentarios_new RENAME TO comentarios")


conn = sqlite3.connect("demandas.db")
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_keys = ON")

migrate_demandas(cursor)
migrate_comentarios(cursor)

cursor.execute("""
    CREATE TABLE IF NOT EXISTS demandas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        solicitante TEXT NOT NULL,
        data_criacao TEXT NOT NULL
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        demanda_id INTEGER NOT NULL,
        comentario TEXT NOT NULL,
        autor TEXT NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (demanda_id) REFERENCES demandas (id)
    )
""")

demandas = [
    (1, "Corrigir bug no login", "Usuarios nao conseguem fazer login", "Joao Silva", "2024-01-15 10:30:00"),
    (2, "Implementar relatorio de vendas", "Precisamos de um relatorio mensal", "Maria Santos", "2024-01-16 14:20:00"),
    (3, "Melhorar performance", "Sistema esta lento", "Pedro Costa", "2024-01-17 09:15:00"),
    (5, "Adicionar filtros", "Usuarios querem filtrar demandas", "Ana Lima", "2024-01-18 11:00:00"),
]

comentarios = [
    (1, 1, "Vou investigar esse bug", "Tech Team", "2024-01-15 11:00:00"),
    (2, 1, "Bug corrigido na branch develop", "Desenvolvedor", "2024-01-15 16:30:00"),
]

cursor.executemany("""
    INSERT OR IGNORE INTO demandas (id, titulo, descricao, solicitante, data_criacao)
    VALUES (?, ?, ?, ?, ?)
""", demandas)

cursor.executemany("""
    INSERT OR IGNORE INTO comentarios (id, demanda_id, comentario, autor, data)
    VALUES (?, ?, ?, ?, ?)
""", comentarios)

conn.commit()
conn.close()

print("Banco de dados criado/atualizado com sucesso!")
