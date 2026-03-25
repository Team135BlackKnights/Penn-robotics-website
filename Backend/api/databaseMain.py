import sqlite3
import os
from datetime import datetime
import logging

'''
!
!
!    IMPORTANT: MAKE SURE THAT YOU HAVE 100% LOOKED AT THE 'README.md' SERIOUSLY, IT IS IMPORTANT.
!
!
'''

current_directory = os.path.dirname(__file__)
database_path = os.path.join(current_directory, "database_api.db")

# Logger (use same logger name as api so handlers forward there when configured)
logger = logging.getLogger('api_logger')

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
conn.commit()
conn.close()

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
    
def get_posts(offset=0, limit=5):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute("SELECT * FROM posts_content ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset))
    posts = c.fetchall()
    
    conn.close()

    post_list = []
    for post in posts:
        image_url = None
        if post[6]:
            filename = os.path.basename(post[6])
            image_url = f"https://api.pennrobotics.org/uploads/{filename}"
            
        post_data = {
            "id": post[0],
            "title": post[1],
            "date": post[2],
            "content_body": post[3],
            "author": post[4],
            "footer": post[5],
            "image": image_url,
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

def get_post_by_id(post_id):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute('''
        SELECT id, title, content_body, date, author, footer, image, file, video
        FROM posts_content
        WHERE id = ?
    ''', (post_id,))

    post = c.fetchone()
    conn.close()

    if not post:
        return None

    # If an image exists, return a fully qualified URL.
    image_url = None
    if post[6]:
        # Extract the filename from the stored path and build the full URL.
        filename = os.path.basename(post[6])
        image_url = f"https://api.pennrobotics.org/uploads/{filename}"

    post_dict = {
        "id": post[0],
        "title": post[1],
        "content_body": post[2],
        "date": post[3],
        "author": post[4],
        "footer": post[5],
        "image": image_url,
        "file": post[7],
        "video": post[8]
    }

    return post_dict

def delete_post(post_id):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()

    c.execute("SELECT 1 FROM posts_content WHERE id = ?", (post_id,))
    post_exists = c.fetchone()

    if not post_exists:
        conn.close()
        return {"message": f"Post {post_id} not found"}, 404

    c.execute("DELETE FROM posts_content WHERE id = ?", (post_id,))

    conn.commit()
    conn.close()

    return {"message": f"Post {post_id} deleted successfully"}, 200

# Create simple settings table for key/value use
conn = sqlite3.connect(database_path)
c = conn.cursor()
c.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
''')

# Images table stores uploaded file metadata for dynamic image slots
c.execute('''
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        filename TEXT NOT NULL,
        mime TEXT,
        uploaded_at TEXT,
        version INTEGER DEFAULT 1
    )
''')

conn.commit()
conn.close()


def set_setting(key, value):
    logger.info(f"set_setting called: key={key}")
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()
    logger.info(f"set_setting saved: key={key}")


def get_setting(key):
    logger.info(f"get_setting called: key={key}")
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    c.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = c.fetchone()
    conn.close()
    val = row[0] if row else None
    logger.info(f"get_setting returning: key={key} -> {val}")
    return val


def set_image_mapping(key, filename, mime=None):
    """Insert or update an image mapping for a key. Increments version on update."""
    logger.info(f"set_image_mapping called for key={key} filename={filename}")
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    c.execute("SELECT version FROM images WHERE key = ?", (key,))
    row = c.fetchone()
    now = datetime.utcnow().isoformat()
    if row:
        version = row[0] + 1
        c.execute("UPDATE images SET filename = ?, mime = ?, uploaded_at = ?, version = ? WHERE key = ?",
                  (filename, mime, now, version, key))
        logger.info(f"set_image_mapping updated existing key={key} to version={version}")
    else:
        version = 1
        c.execute("INSERT INTO images (key, filename, mime, uploaded_at, version) VALUES (?, ?, ?, ?, ?)",
                  (key, filename, mime, now, version))
        logger.info(f"set_image_mapping created key={key} version={version}")
    conn.commit()
    conn.close()
    return version


def get_image_mapping(key):
    """Return mapping dict for key or None."""
    logger.info(f"get_image_mapping called for key={key}")
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    c.execute("SELECT filename, mime, uploaded_at, version FROM images WHERE key = ?", (key,))
    row = c.fetchone()
    conn.close()
    if not row:
        logger.info(f"get_image_mapping: no mapping found for key={key}")
        return None
    mapping = {
        'filename': row[0],
        'mime': row[1],
        'uploaded_at': row[2],
        'version': row[3]
    }
    logger.info(f"get_image_mapping returning for key={key}: {mapping}")
    return mapping


def delete_image_mapping(key):
    conn = sqlite3.connect(database_path)
    c = conn.cursor()
    c.execute("DELETE FROM images WHERE key = ?", (key,))
    conn.commit()
    conn.close()