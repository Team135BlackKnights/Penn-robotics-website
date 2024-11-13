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

# Connect to the SQLite database file in the current directory
conn = sqlite3.connect(database_path)
c = conn.cursor()
# Create the table with correct data types and syntax
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

# Commit changes and close the connection
conn.commit()
conn.close()
