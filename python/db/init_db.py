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
        - categories: Armazena categorias de tarefas
        - tasks: Armazena tarefas dos usuários
        - subtasks: Armazena subtarefas das tarefas

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

        # Tabela de categorias
        conn.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                nome TEXT NOT NULL,
                cor TEXT DEFAULT '#F97316',
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)


        
        # Tabela de tarefas
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                categoria_id INTEGER,
                titulo TEXT NOT NULL,
                descricao TEXT,
                status TEXT DEFAULT 'pendente',
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_vencimento DATE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (categoria_id) REFERENCES categories (id) ON DELETE SET NULL
            )
        """)

        cursor = conn.execute(f"PRAGMA table_info(tasks);")

        columns = [info[1] for info in cursor.fetchall()]

        print(columns)

        # Tabela de subtarefas
        conn.execute("""
            CREATE TABLE IF NOT EXISTS subtasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                concluida BOOLEAN DEFAULT 0,
                ordem INTEGER DEFAULT 0,
                FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
            )
        """)

        conn.commit()