import os

DB_URL = os.environ.get('DATABASE_URL', 'sqlite+aiosqlite:///./test.db')
