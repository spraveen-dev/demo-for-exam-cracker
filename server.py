from flask import Flask, request, jsonify, send_from_directory
import os

try:
    from database import (
        init_database, get_documents, add_document, delete_document,
        get_subsections, add_subsection, delete_subsection
    )
    DB_AVAILABLE = True
    try:
        init_database()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")
        DB_AVAILABLE = False
except Exception as e:
    print(f"Database not available: {e}")
    DB_AVAILABLE = False

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/api/documents', methods=['GET', 'POST'])
def handle_documents():
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not configured'}), 500
    
    if request.method == 'GET':
        try:
            category = request.args.get('category')
            subcategory = request.args.get('subcategory')
            documents = get_documents(category, subcategory)
            return jsonify({'success': True, 'documents': documents})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            category = data.get('category')
            subcategory = data.get('subcategory')
            name = data.get('name')
            link = data.get('link')
            uploaded_by = data.get('uploadedBy', 'admin')
            
            if not all([category, subcategory, name, link]):
                return jsonify({'success': False, 'error': 'Missing required fields'}), 400
            
            document = add_document(category, subcategory, name, link, uploaded_by)
            return jsonify({'success': True, 'document': document})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/documents/<int:doc_id>', methods=['DELETE'])
def handle_document_delete(doc_id):
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        success = delete_document(doc_id)
        if success:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Document not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/subsections', methods=['GET', 'POST'])
def handle_subsections():
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not configured'}), 500
    
    if request.method == 'GET':
        try:
            category = request.args.get('category')
            subsections = get_subsections(category)
            return jsonify({'success': True, 'subsections': subsections})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            category = data.get('category')
            name = data.get('name')
            icon = data.get('icon', 'fa-folder')
            
            if not all([category, name]):
                return jsonify({'success': False, 'error': 'Missing required fields'}), 400
            
            subsection = add_subsection(category, name, icon)
            return jsonify({'success': True, 'subsection': subsection})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/subsections/<int:subsection_id>', methods=['DELETE'])
def handle_subsection_delete(subsection_id):
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        success = delete_subsection(subsection_id)
        if success:
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'Subsection not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    if path.endswith('.html'):
        return send_from_directory('.', path)
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
