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

conn.commit()
conn.close()
