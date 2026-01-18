"""
Inicialização do banco de dados.

Este módulo cria as tabelas necessárias no banco SQLite.
"""

from db.database import get_db


def init_db():
    """
    Inicializa o banco de dados criando as tabelas necessárias.

    Cria as seguintes tabelas:
        - users: Armazena usuários do sistema
        - tasks: Armazena tarefas dos usuários

    Note:
        Esta função é idempotente - pode ser executada múltiplas vezes
        sem causar erros, pois usa CREATE TABLE IF NOT EXISTS.
    """
    for conn in get_db():
        # Tabela de usuários
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        """)

        # Tabela de tarefas
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                descricao TEXT,
                status TEXT DEFAULT 'pendente',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        conn.commit()
 