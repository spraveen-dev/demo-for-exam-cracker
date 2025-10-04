import psycopg2
import os
from psycopg2.extras import RealDictCursor
import json

def get_db_connection():
    """Get database connection using environment variables"""
    database_url = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')
    
    if not database_url:
        raise Exception("Database URL not found. Please set POSTGRES_URL or DATABASE_URL environment variable.")
    
    conn = psycopg2.connect(database_url)
    return conn

def init_database():
    """Initialize database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                category VARCHAR(255) NOT NULL,
                subcategory VARCHAR(255) NOT NULL,
                name VARCHAR(500) NOT NULL,
                link TEXT NOT NULL,
                uploaded_by VARCHAR(255),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cur.execute('''
            CREATE TABLE IF NOT EXISTS subsections (
                id SERIAL PRIMARY KEY,
                category VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(100) DEFAULT 'fa-folder',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, name)
            )
        ''')
        
        cur.execute('''
            CREATE INDEX IF NOT EXISTS idx_documents_category 
            ON documents(category, subcategory)
        ''')
        
        cur.execute('''
            CREATE INDEX IF NOT EXISTS idx_subsections_category 
            ON subsections(category)
        ''')
        
        conn.commit()
        print("Database tables initialized successfully")
    except Exception as e:
        conn.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        cur.close()
        conn.close()

def get_documents(category=None, subcategory=None):
    """Get documents, optionally filtered by category and subcategory"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if category and subcategory:
            cur.execute(
                'SELECT * FROM documents WHERE category = %s AND subcategory = %s ORDER BY uploaded_at DESC',
                (category, subcategory)
            )
        elif category:
            cur.execute(
                'SELECT * FROM documents WHERE category = %s ORDER BY uploaded_at DESC',
                (category,)
            )
        else:
            cur.execute('SELECT * FROM documents ORDER BY uploaded_at DESC')
        
        documents = cur.fetchall()
        return [dict(doc) for doc in documents]
    finally:
        cur.close()
        conn.close()

def add_document(category, subcategory, name, link, uploaded_by):
    """Add a new document"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            '''INSERT INTO documents (category, subcategory, name, link, uploaded_by) 
               VALUES (%s, %s, %s, %s, %s) RETURNING *''',
            (category, subcategory, name, link, uploaded_by)
        )
        document = cur.fetchone()
        conn.commit()
        return dict(document)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def delete_document(doc_id):
    """Delete a document by ID"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('DELETE FROM documents WHERE id = %s', (doc_id,))
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def get_subsections(category=None):
    """Get subsections, optionally filtered by category"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if category:
            cur.execute(
                'SELECT * FROM subsections WHERE category = %s ORDER BY created_at',
                (category,)
            )
        else:
            cur.execute('SELECT * FROM subsections ORDER BY created_at')
        
        subsections = cur.fetchall()
        return [dict(sub) for sub in subsections]
    finally:
        cur.close()
        conn.close()

def add_subsection(category, name, icon):
    """Add a new subsection"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            '''INSERT INTO subsections (category, name, icon) 
               VALUES (%s, %s, %s) 
               ON CONFLICT (category, name) DO UPDATE 
               SET icon = EXCLUDED.icon 
               RETURNING *''',
            (category, name, icon)
        )
        subsection = cur.fetchone()
        conn.commit()
        return dict(subsection)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def delete_subsection(subsection_id):
    """Delete a subsection by ID and its associated documents"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('SELECT category, name FROM subsections WHERE id = %s', (subsection_id,))
        result = cur.fetchone()
        
        if result:
            category, name = result
            cur.execute('DELETE FROM documents WHERE category = %s AND subcategory = %s', (category, name))
        
        cur.execute('DELETE FROM subsections WHERE id = %s', (subsection_id,))
        conn.commit()
        return cur.rowcount > 0
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
