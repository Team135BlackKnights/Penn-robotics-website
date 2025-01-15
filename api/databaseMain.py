import sqlite3
import os

'''
!
!
!    IMPORTANT: MAKE SURE THAT YOU HAVE 100% LOOKED AT THE 'README.md' SERIOUSLY, IT IS IMPORTANT.
!
!
'''

current_directory = os.path.dirname(__file__)
database_path = os.path.join(current_directory, "database_api.db")

conn = sqlite3.connect(database_path)
c = conn.cursor()
c.execute('''
    CREATE TABLE IF NOT EXISTS posts_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Primary key/id that is a reference to that post that also auto-increments
        title TEXT NOT NULL,
        date TEXT,
        content_body TEXT,
        author TEXT,
        footer TEXT,
        image TEXT,
        file TEXT,
        video TEXT
    )
''')

def make_a_post(title, content, date=None, author=None, footer=None, image=None, file=None, video=None):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    query = '''
        INSERT INTO posts_content (title, date, content_body, author, footer, image, file, video)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
    c.execute(query, (title, date, content, author, footer, image, file, video))
    
    conn.commit()
    conn.close()
    
def get_posts():
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute("SELECT * FROM posts_content")
    posts = c.fetchall()
    
    conn.close()

    post_list = []
    for post in posts:
        post_data = {
            "id": post[0],
            "title": post[1],
            "date": post[2],
            "content_body": post[3],
            "author": post[4],
            "footer": post[5],
            "image": post[6],
            "file": post[7],
            "video": post[8]
        }
        post_list.append(post_data)
    return post_list

def edit_post(post_id, updates):
    """
    Updates a post in the database based on the provided fields.
    
    :param post_id: ID of the post to update
    :param updates: Dictionary of fields to update and their new values
    :return: A message indicating success or failure
    """
    
    if not updates:
        return "No fields provided to update"

    set_clause = ", ".join([f"{key} = ?" for key in updates.keys()])
    query = f"UPDATE posts_content SET {set_clause} WHERE id = ?"

    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute("SELECT 1 FROM posts_content WHERE id = ?", (post_id,))
    post_exists = c.fetchone()

    if not post_exists:
        conn.close()
        return f"Post with ID {post_id} not found"

    c.execute(query, (*updates.values(), post_id))
    conn.commit()
    conn.close()

    return f"Post {post_id} updated successfully"

def delete_post(post_id):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute("SELECT 1 FROM posts_content WHERE id = ?", (post_id,))
    post_exists = c.fetchone()

    if not post_exists:
        conn.close()
        return {"message": f"Post {post_id} not found"}, 404

    c.execute("DELETE FROM posts_content WHERE id = ?", (post_id,))
    
    c.execute("""
        UPDATE posts_content
        SET id = id - 1
        WHERE id > ?
    """, (post_id,))

    conn.commit()

    c.execute("SELECT MAX(id) FROM posts_content")
    max_id = c.fetchone()[0] or 0
    c.execute(f"UPDATE sqlite_sequence SET seq = ? WHERE name = 'posts_content'", (max_id,))

    conn.commit()
    conn.close()

    return {"message": f"Post {post_id} deleted successfully"}, 200

conn.commit()
conn.close()
