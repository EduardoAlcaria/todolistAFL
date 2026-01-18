def get_user_by_email(conn, email: str):
   


    rows = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()
    
    if rows is not None:
        for row in rows:
            print(row)

    return rows

def create_user(conn, email: str, password_hash: str):
    conn.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (email, password_hash)
    )
    conn.commit()
