from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import sqlite3
import bcrypt
import os
import json
from datetime import datetime, timedelta
import dropbox
from dropbox import DropboxOAuth2FlowNoRedirect
from dropbox.files import WriteMode

app = Flask(__name__, static_folder='EXAM CRACKER', static_url_path='')
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True)

# Dropbox configuration
DROPBOX_ACCESS_TOKEN = os.environ.get('DROPBOX_ACCESS_TOKEN')
DROPBOX_APP_KEY = os.environ.get('DROPBOX_APP_KEY')
DROPBOX_APP_SECRET = os.environ.get('DROPBOX_APP_SECRET')
DROPBOX_REFRESH_TOKEN = os.environ.get('DROPBOX_REFRESH_TOKEN')

def get_dropbox_client():
    if DROPBOX_ACCESS_TOKEN:
        return dropbox.Dropbox(DROPBOX_ACCESS_TOKEN)
    return None

# Root route - serve index.html
@app.route('/')
def home():
    return send_from_directory('EXAM CRACKER', 'index.html')

# Serve HTML files
@app.route('/<path:filename>')
def serve_html(filename):
    if filename.endswith('.html'):
        return send_from_directory('EXAM CRACKER', filename)
    return send_from_directory('EXAM CRACKER', filename)

# Database initialization
def init_db():
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password TEXT,
                  is_admin BOOLEAN,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Subjects table
    c.execute('''CREATE TABLE IF NOT EXISTS subjects
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT UNIQUE,
                  icon TEXT,
                  display_order INTEGER)''')
    
    # Subsections table
    c.execute('''CREATE TABLE IF NOT EXISTS subsections
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  subject_id INTEGER,
                  name TEXT,
                  icon TEXT,
                  display_order INTEGER,
                  FOREIGN KEY (subject_id) REFERENCES subjects(id))''')
    
    # Documents table
    c.execute('''CREATE TABLE IF NOT EXISTS documents
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  subsection_id INTEGER,
                  name TEXT,
                  link TEXT,
                  upload_method TEXT,
                  dropbox_path TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (subsection_id) REFERENCES subsections(id))''')
    
    # Question papers table
    c.execute('''CREATE TABLE IF NOT EXISTS question_papers
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  subject_id INTEGER,
                  subsection_id INTEGER,
                  name TEXT,
                  link TEXT,
                  upload_method TEXT,
                  dropbox_path TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (subject_id) REFERENCES subjects(id),
                  FOREIGN KEY (subsection_id) REFERENCES subsections(id))''')
    
    # Insert default subjects if they don't exist
    subjects = [
        ('தமிழ்', 'fa-book', 1),
        ('English', 'fa-book', 2),
        ('Mathematics', 'fa-calculator', 3)
    ]
    
    for subject in subjects:
        c.execute('INSERT OR IGNORE INTO subjects (name, icon, display_order) VALUES (?, ?, ?)', subject)
    
    # Insert default subsection for Tamil
    tamil_id = c.execute('SELECT id FROM subjects WHERE name = ?', ('தமிழ்',)).fetchone()
    if tamil_id:
        c.execute('''INSERT OR IGNORE INTO subsections (subject_id, name, icon, display_order) 
                     VALUES (?, ?, ?, ?)''', (tamil_id[0], 'தமிழ் கையேடு 2025-2026', 'fa-folder', 1))
    
    conn.commit()
    conn.close()

init_db()

# Authentication endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Check if admin
    if username == 'praveen' and password == 'PRAVEEN@1234':
        session['user'] = username
        session['is_admin'] = True
        return jsonify({'success': True, 'is_admin': True, 'username': username})
    
    # Allow any other username/password for regular users
    if username and password:
        session['user'] = username
        session['is_admin'] = False
        return jsonify({'success': True, 'is_admin': False, 'username': username})
    
    return jsonify({'success': False, 'message': 'Please enter username and password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user' in session:
        return jsonify({
            'authenticated': True, 
            'username': session['user'],
            'is_admin': session.get('is_admin', False)
        })
    return jsonify({'authenticated': False})

# Subject endpoints
@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('SELECT id, name, icon, display_order FROM subjects ORDER BY display_order')
    subjects = [{'id': row[0], 'name': row[1], 'icon': row[2], 'display_order': row[3]} for row in c.fetchall()]
    conn.close()
    return jsonify(subjects)

# Subsection endpoints
@app.route('/api/subjects/<int:subject_id>/subsections', methods=['GET'])
def get_subsections(subject_id):
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('SELECT id, name, icon, display_order FROM subsections WHERE subject_id = ? ORDER BY display_order', (subject_id,))
    subsections = [{'id': row[0], 'name': row[1], 'icon': row[2], 'display_order': row[3]} for row in c.fetchall()]
    conn.close()
    return jsonify(subsections)

@app.route('/api/subjects/<int:subject_id>/subsections', methods=['POST'])
def add_subsection(subject_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    data = request.json
    name = data.get('name')
    icon = data.get('icon', 'fa-folder')
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    
    # Get max display_order
    max_order = c.execute('SELECT MAX(display_order) FROM subsections WHERE subject_id = ?', (subject_id,)).fetchone()[0]
    display_order = (max_order or 0) + 1
    
    c.execute('INSERT INTO subsections (subject_id, name, icon, display_order) VALUES (?, ?, ?, ?)',
              (subject_id, name, icon, display_order))
    subsection_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': subsection_id})

@app.route('/api/subsections/<int:subsection_id>', methods=['DELETE'])
def delete_subsection(subsection_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    
    # Delete associated documents first
    c.execute('DELETE FROM documents WHERE subsection_id = ?', (subsection_id,))
    c.execute('DELETE FROM question_papers WHERE subsection_id = ?', (subsection_id,))
    
    # Delete subsection
    c.execute('DELETE FROM subsections WHERE id = ?', (subsection_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

# Document endpoints (for materials)
@app.route('/api/subsections/<int:subsection_id>/documents', methods=['GET'])
def get_documents(subsection_id):
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('SELECT id, name, link, upload_method, dropbox_path FROM documents WHERE subsection_id = ?', (subsection_id,))
    documents = [{'id': row[0], 'name': row[1], 'link': row[2], 'upload_method': row[3], 'dropbox_path': row[4]} for row in c.fetchall()]
    conn.close()
    return jsonify(documents)

@app.route('/api/subsections/<int:subsection_id>/documents', methods=['POST'])
def add_document(subsection_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    data = request.json
    name = data.get('name')
    link = data.get('link', '')
    upload_method = data.get('upload_method', 'link')
    dropbox_path = ''
    
    # Handle Dropbox file upload
    if upload_method == 'drive' and data and 'file_data' in data:
        try:
            dbx = get_dropbox_client()
            if dbx:
                import base64
                file_data = data.get('file_data')
                file_name = data.get('file_name', name)
                
                # Decode base64 file data
                file_bytes = base64.b64decode(file_data)
                
                # Upload to Dropbox
                path = f'/ExamCracker/{file_name}'
                dbx.files_upload(file_bytes, path, mode=WriteMode('overwrite'))
                
                # Get shareable link
                try:
                    shared_link = dbx.sharing_create_shared_link_with_settings(path)
                    link = shared_link.url.replace('?dl=0', '?dl=1')
                except Exception:
                    # Link might already exist
                    links = dbx.sharing_list_shared_links(path=path)
                    if links.links:
                        link = links.links[0].url.replace('?dl=0', '?dl=1')
                    else:
                        raise
                
                dropbox_path = path
        except Exception as e:
            return jsonify({'success': False, 'message': f'Dropbox error: {str(e)}'}), 500
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('INSERT INTO documents (subsection_id, name, link, upload_method, dropbox_path) VALUES (?, ?, ?, ?, ?)',
              (subsection_id, name, link, upload_method, dropbox_path))
    doc_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': doc_id})

@app.route('/api/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('DELETE FROM documents WHERE id = ?', (doc_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

# Question paper endpoints
@app.route('/api/subjects/<int:subject_id>/questions', methods=['GET'])
def get_questions(subject_id):
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('''SELECT qp.id, qp.name, qp.link, qp.upload_method, qp.dropbox_path, 
                 s.id as subsection_id, s.name as subsection_name
                 FROM question_papers qp
                 LEFT JOIN subsections s ON qp.subsection_id = s.id
                 WHERE qp.subject_id = ? OR s.subject_id = ?''', (subject_id, subject_id))
    
    questions = []
    for row in c.fetchall():
        questions.append({
            'id': row[0], 
            'name': row[1], 
            'link': row[2], 
            'upload_method': row[3],
            'dropbox_path': row[4],
            'subsection_id': row[5],
            'subsection_name': row[6]
        })
    conn.close()
    return jsonify(questions)

@app.route('/api/subjects/<int:subject_id>/questions', methods=['POST'])
def add_question(subject_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    data = request.json
    name = data.get('name')
    link = data.get('link', '')
    upload_method = data.get('upload_method', 'link')
    dropbox_path = ''
    subsection_id = data.get('subsection_id')
    
    # Handle Dropbox file upload
    if upload_method == 'drive' and data and 'file_data' in data:
        try:
            dbx = get_dropbox_client()
            if dbx:
                import base64
                file_data = data.get('file_data')
                file_name = data.get('file_name', name)
                
                # Decode base64 file data
                file_bytes = base64.b64decode(file_data)
                
                # Upload to Dropbox
                path = f'/ExamCracker/Questions/{file_name}'
                dbx.files_upload(file_bytes, path, mode=WriteMode('overwrite'))
                
                # Get shareable link
                try:
                    shared_link = dbx.sharing_create_shared_link_with_settings(path)
                    link = shared_link.url.replace('?dl=0', '?dl=1')
                except Exception:
                    # Link might already exist
                    links = dbx.sharing_list_shared_links(path=path)
                    if links.links:
                        link = links.links[0].url.replace('?dl=0', '?dl=1')
                    else:
                        raise
                
                dropbox_path = path
        except Exception as e:
            return jsonify({'success': False, 'message': f'Dropbox error: {str(e)}'}), 500
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('INSERT INTO question_papers (subject_id, subsection_id, name, link, upload_method, dropbox_path) VALUES (?, ?, ?, ?, ?, ?)',
              (subject_id, subsection_id, name, link, upload_method, dropbox_path))
    qp_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': qp_id})

@app.route('/api/questions/<int:qp_id>', methods=['DELETE'])
def delete_question(qp_id):
    if not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Admin access required'}), 403
    
    conn = sqlite3.connect('exam_cracker.db')
    c = conn.cursor()
    c.execute('DELETE FROM question_papers WHERE id = ?', (qp_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
