def get_tasks_by_user(conn, user_id: int):
    rows = conn.execute(
        "SELECT * FROM tasks WHERE user_id = ?", (user_id,)
    ).fetchall()
    return rows

def create_task(conn, user_id: int, titulo: str, descricao: str, status: str):
    cursor = conn.execute(
        "INSERT INTO tasks (user_id, titulo, descricao, status) VALUES (?, ?, ?, ?)",
        (user_id, titulo, descricao, status)
    )
    conn.commit()
    return cursor.lastrowid

def update_task(conn, task_id: int, user_id: int, titulo: str, descricao: str, status: str):
    conn.execute(
        "UPDATE tasks SET titulo = ?, descricao = ?, status = ? WHERE id = ? AND user_id = ?",
        (titulo, descricao, status, task_id, user_id)
    )
    conn.commit()

def delete_task(conn, task_id: int, user_id: int):
    conn.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id)
    )
    conn.commit()

def get_task_by_id(conn, task_id: int, user_id: int):
    row = conn.execute(
        "SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id)
    ).fetchone()
    return row