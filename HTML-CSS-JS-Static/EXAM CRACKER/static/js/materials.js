// Materials page functionality
const API_URL = window.location.origin;
let isAdmin = false;
let currentSubjects = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check auth and get user info
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Load subjects and materials
    await loadMaterials();
    
    // Initialize accordion functionality
    initAccordion();
    
    // Update user display
    const navUsername = document.getElementById('navUsername');
    if (navUsername) {
        navUsername.textContent = localStorage.getItem('username') || 'User';
    }
});

async function loadMaterials() {
    try {
        const response = await fetch(`${API_URL}/api/subjects`, {
            credentials: 'include'
        });
        const subjects = await response.json();
        currentSubjects = subjects;
        
        const container = document.querySelector('.accordion-container');
        container.innerHTML = '';
        
        for (const subject of subjects) {
            const subsectionsResponse = await fetch(`${API_URL}/api/subjects/${subject.id}/subsections`, {
                credentials: 'include'
            });
            const subsections = await subsectionsResponse.json();
            
            const subjectElement = createSubjectElement(subject, subsections);
            container.appendChild(subjectElement);
        }
    } catch (error) {
        console.error('Error loading materials:', error);
        showNotification('Failed to load materials', 'error');
    }
}

function createSubjectElement(subject, subsections) {
    const div = document.createElement('div');
    div.className = 'accordion-item';
    
    const addSubsectionBtn = isAdmin ? `
        <button class="admin-btn add-subsection-btn" onclick="showAddSubsectionModal(${subject.id}, '${subject.name}')" title="Add New Subsection">
            <i class="fas fa-plus"></i> Add New Subsection
        </button>
    ` : '';
    
    let subsectionsHTML = '';
    for (const subsection of subsections) {
        subsectionsHTML += createSubsectionElement(subject.id, subsection);
    }
    
    div.innerHTML = `
        <div class="accordion-header" data-subject="${subject.name}">
            <i class="${subject.icon} subject-icon"></i>
            <span class="subject-name">${subject.name}</span>
            <i class="fas fa-chevron-down toggle-icon"></i>
        </div>
        <div class="accordion-content">
            ${addSubsectionBtn}
            ${subsectionsHTML}
        </div>
    `;
    
    return div;
}

function createSubsectionElement(subjectId, subsection) {
    const deleteBtn = isAdmin ? `
        <button class="delete-btn" onclick="deleteSubsection(${subsection.id}, '${subsection.name}')" title="Delete Subsection">
            <i class="fas fa-trash"></i>
        </button>
    ` : '';
    
    const uploadBtn = isAdmin ? `
        <button class="upload-btn" onclick="showUploadModal(${subjectId}, ${subsection.id}, '${subsection.name}')" title="Upload Document">
            <i class="fas fa-upload"></i> Upload Document
        </button>
    ` : '';
    
    return `
        <div class="subcategory" data-subsection-id="${subsection.id}">
            <div class="subcategory-header" data-subcategory="${subsection.name}">
                <i class="${subsection.icon}"></i>
                <span>${subsection.name}</span>
                ${deleteBtn}
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="subcategory-content">
                ${uploadBtn}
                <div class="documents-list" id="documents-${subsection.id}">
                    <div class="loading">Loading documents...</div>
                </div>
            </div>
        </div>
    `;
}

async function loadDocuments(subsectionId) {
    try {
        const response = await fetch(`${API_URL}/api/subsections/${subsectionId}/documents`, {
            credentials: 'include'
        });
        const documents = await response.json();
        
        const container = document.getElementById(`documents-${subsectionId}`);
        if (documents.length === 0) {
            container.innerHTML = '<p class="no-documents">No documents available</p>';
            return;
        }
        
        container.innerHTML = documents.map(doc => createDocumentElement(doc)).join('');
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function createDocumentElement(doc) {
    const deleteBtn = isAdmin ? `
        <button class="delete-btn-small" onclick="deleteDocument(${doc.id}, '${doc.name}')" title="Delete">
            <i class="fas fa-trash"></i>
        </button>
    ` : '';
    
    const link = doc.dropbox_path || doc.link || '#';
    
    return `
        <div class="material-item">
            <a href="${link}" target="_blank" style="text-decoration: none;">
                <span>${doc.name}</span>
            </a>
            <div class="material-actions">
                ${deleteBtn}
                <a href="${link}" target="_blank" style="text-decoration: none;">
                    <button class="download-btn">
                        <i class="fas fa-download"></i>
                    </button>
                </a>
            </div>
        </div>
    `;
}

function initAccordion() {
    document.addEventListener('click', async function(e) {
        // Main accordion
        if (e.target.closest('.accordion-header')) {
            const header = e.target.closest('.accordion-header');
            const item = header.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            const icon = header.querySelector('.toggle-icon');
            
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            }
            
            // Add ripple effect
            addRippleEffect(header, e);
        }
        
        // Subcategory accordion
        if (e.target.closest('.subcategory-header')) {
            const header = e.target.closest('.subcategory-header');
            const subcategory = header.closest('.subcategory');
            const content = subcategory.querySelector('.subcategory-content');
            const icon = header.querySelector('.fa-chevron-right');
            const subsectionId = subcategory.dataset.subsectionId;
            
            subcategory.classList.toggle('active');
            if (subcategory.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(90deg)';
                
                // Load documents if not already loaded
                if (subsectionId) {
                    await loadDocuments(subsectionId);
                }
            } else {
                content.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            }
            
            // Add ripple effect
            addRippleEffect(header, e);
        }
    });
}

function addRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(220, 38, 38, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Admin functions
function showUploadModal(subjectId, subsectionId, subsectionName) {
    const subjectName = currentSubjects.find(s => s.id === subjectId)?.name || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">Upload Document</h2>
            <p class="modal-info">Category: <strong>${subjectName}</strong></p>
            <p class="modal-info">Subcategory: <strong>${subsectionName}</strong></p>
            
            <div class="form-group">
                <label>Document Name:</label>
                <input type="text" id="docName" class="modal-input" placeholder="Enter document name">
            </div>
            
            <div class="form-group">
                <label>Upload Method:</label>
                <select id="uploadMethod" class="modal-select">
                    <option value="link">Paste Link</option>
                    <option value="drive">Upload File (Google Drive)</option>
                </select>
            </div>
            
            <div id="linkSection" class="form-group">
                <label>Document Link:</label>
                <input type="url" id="docLink" class="modal-input" placeholder="https://...">
            </div>
            
            <div id="fileSection" class="form-group" style="display:none;">
                <label>Select File:</label>
                <input type="file" id="docFile" class="modal-file-input">
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn-primary" onclick="uploadDocument(${subsectionId})">
                    <i class="fas fa-check"></i> Upload
                </button>
                <button class="modal-btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle upload method change
    document.getElementById('uploadMethod').addEventListener('change', function() {
        if (this.value === 'link') {
            document.getElementById('linkSection').style.display = 'block';
            document.getElementById('fileSection').style.display = 'none';
        } else {
            document.getElementById('linkSection').style.display = 'none';
            document.getElementById('fileSection').style.display = 'block';
        }
    });
}

async function uploadDocument(subsectionId) {
    const name = document.getElementById('docName').value.trim();
    const method = document.getElementById('uploadMethod').value;
    const link = method === 'link' ? document.getElementById('docLink').value.trim() : '';
    
    if (!name) {
        showNotification('Please enter document name', 'error');
        return;
    }
    
    if (method === 'link' && !link) {
        showNotification('Please enter document link', 'error');
        return;
    }
    
    let requestBody = { name, link, upload_method: method };
    
    // Handle file upload
    if (method === 'drive') {
        const fileInput = document.getElementById('docFile');
        if (!fileInput.files || fileInput.files.length === 0) {
            showNotification('Please select a file', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        try {
            // Read file as base64
            const fileData = await readFileAsBase64(file);
            requestBody.file_data = fileData;
            requestBody.file_name = file.name;
        } catch (error) {
            showNotification('Error reading file', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_URL}/api/subsections/${subsectionId}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Document uploaded successfully', 'success');
            closeModal();
            await loadDocuments(subsectionId);
        } else {
            showNotification(data.message || 'Upload failed', 'error');
        }
    } catch (error) {
        showNotification('Server error: ' + error.message, 'error');
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showAddSubsectionModal(subjectId, subjectName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">Add New Subsection</h2>
            <p class="modal-info">Category: <strong>${subjectName}</strong></p>
            
            <div class="form-group">
                <label>Subsection Name:</label>
                <input type="text" id="subsectionName" class="modal-input" placeholder="Enter subsection name">
            </div>
            
            <div class="form-group">
                <label>Icon (FontAwesome class):</label>
                <input type="text" id="subsectionIcon" class="modal-input" value="fa-folder" placeholder="fa-folder">
            </div>
            
            <div class="modal-buttons">
                <button class="modal-btn-primary" onclick="addSubsection(${subjectId})">
                    <i class="fas fa-check"></i> Create
                </button>
                <button class="modal-btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function addSubsection(subjectId) {
    const name = document.getElementById('subsectionName').value.trim();
    const icon = document.getElementById('subsectionIcon').value.trim() || 'fa-folder';
    
    if (!name) {
        showNotification('Please enter subsection name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/subjects/${subjectId}/subsections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, icon })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Subsection added successfully', 'success');
            closeModal();
            await loadMaterials();
        } else {
            showNotification(data.message || 'Failed to add subsection', 'error');
        }
    } catch (error) {
        showNotification('Server error', 'error');
    }
}

async function deleteSubsection(subsectionId, name) {
    if (!confirm(`Are you sure you want to delete "${name}" and all its documents?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/subsections/${subsectionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Subsection deleted successfully', 'success');
            await loadMaterials();
        } else {
            showNotification(data.message || 'Failed to delete', 'error');
        }
    } catch (error) {
        showNotification('Server error', 'error');
    }
}

async function deleteDocument(docId, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/documents/${docId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Document deleted successfully', 'success');
            // Reload all materials to refresh
            await loadMaterials();
        } else {
            showNotification(data.message || 'Failed to delete', 'error');
        }
    } catch (error) {
        showNotification('Server error', 'error');
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
