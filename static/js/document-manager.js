class DocumentManager {
    constructor() {
        this.documents = {};
        this.subsections = {};
        this.isAdmin = localStorage.getItem('userRole') === 'admin';
    }

    async loadDocuments(category, subcategory) {
        try {
            let url = '/api/documents';
            if (category && subcategory) {
                url += `?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;
            } else if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data.documents;
            }
            return [];
        } catch (error) {
            console.error('Error loading documents:', error);
            return [];
        }
    }

    async loadSubsections(category) {
        try {
            let url = '/api/subsections';
            if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                return data.subsections;
            }
            return [];
        } catch (error) {
            console.error('Error loading subsections:', error);
            return [];
        }
    }

    async addDocument(category, subcategory, documentData) {
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    subcategory,
                    name: documentData.name,
                    link: documentData.link,
                    uploadedBy: localStorage.getItem('username') || 'admin'
                })
            });
            
            const data = await response.json();
            return data.success ? data.document : null;
        } catch (error) {
            console.error('Error adding document:', error);
            return null;
        }
    }

    async deleteDocument(docId) {
        try {
            const response = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    }

    async addSubsection(category, name, icon) {
        try {
            const response = await fetch('/api/subsections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    name,
                    icon
                })
            });
            
            const data = await response.json();
            return data.success ? data.subsection : null;
        } catch (error) {
            console.error('Error adding subsection:', error);
            return null;
        }
    }

    async deleteSubsection(subsectionId) {
        try {
            const response = await fetch(`/api/subsections/${subsectionId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error deleting subsection:', error);
            return false;
        }
    }

    renderUploadButton(category, subcategory, containerId) {
        if (!this.isAdmin) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const uploadBtn = document.createElement('div');
        uploadBtn.className = 'upload-document-btn';
        uploadBtn.innerHTML = `
            <button onclick="documentManager.showUploadModal('${category}', '${subcategory}')">
                <i class="fas fa-upload"></i> Upload Document
            </button>
        `;
        container.insertBefore(uploadBtn, container.firstChild);
    }

    renderAddSubsectionButton(category, accordionContent) {
        if (!this.isAdmin) return;

        const existingBtn = accordionContent.querySelector('.add-subsection-btn');
        if (existingBtn) return;

        const addSubsectionBtn = document.createElement('div');
        addSubsectionBtn.className = 'add-subsection-btn';
        addSubsectionBtn.innerHTML = `
            <button onclick="documentManager.showAddSubsectionModal('${category}')">
                <i class="fas fa-plus"></i> Add New Subsection
            </button>
        `;
        accordionContent.insertBefore(addSubsectionBtn, accordionContent.firstChild);
    }

    showAddSubsectionModal(category) {
        const modal = document.createElement('div');
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Subsection</h3>
                <p>Category: <strong>${category}</strong></p>
                
                <div class="upload-form">
                    <label>Subsection Name:</label>
                    <input type="text" id="subsectionName" placeholder="Enter subsection name" />
                    
                    <label>Icon (FontAwesome class):</label>
                    <input type="text" id="subsectionIcon" placeholder="e.g., fa-book" value="fa-folder" />
                    
                    <div class="modal-buttons">
                        <button onclick="documentManager.createSubsection('${category}')" class="btn-primary">
                            <i class="fas fa-check"></i> Create
                        </button>
                        <button onclick="documentManager.closeModal()" class="btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async createSubsection(category) {
        const subsectionName = document.getElementById('subsectionName').value.trim();
        const subsectionIcon = document.getElementById('subsectionIcon').value.trim() || 'fa-folder';
        
        if (!subsectionName) {
            alert('Please enter a subsection name');
            return;
        }

        const result = await this.addSubsection(category, subsectionName, subsectionIcon);
        
        if (result) {
            this.closeModal();
            showNotification('Subsection created successfully! Refreshing page...', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert('Failed to create subsection. Please try again.');
        }
    }

    async renderCustomSubsections(category, accordionContent) {
        const subsections = await this.loadSubsections(category);

        subsections.forEach(subsection => {
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.className = 'subcategory';
            subcategoryDiv.innerHTML = `
                <div class="subcategory-header" data-subcategory="${subsection.name}">
                    <i class="fas ${subsection.icon}"></i>
                    <span>${subsection.name}</span>
                    <i class="fas fa-chevron-right"></i>
                    ${this.isAdmin ? `
                        <button class="delete-subsection-btn" onclick="documentManager.deleteSubsectionConfirm(${subsection.id}); event.stopPropagation();" style="margin-left: auto; background: #dc2626; border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="subcategory-content">
                    <div id="custom-uploads-${subsection.id}"></div>
                </div>
            `;
            
            accordionContent.appendChild(subcategoryDiv);
        });
    }

    async deleteSubsectionConfirm(subsectionId) {
        if (!confirm('Are you sure you want to delete this subsection? All documents in it will also be removed.')) {
            return;
        }

        const success = await this.deleteSubsection(subsectionId);
        
        if (success) {
            showNotification('Subsection deleted successfully!', 'success');
            setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            alert('Failed to delete subsection. Please try again.');
        }
    }

    showUploadModal(category, subcategory) {
        const modal = document.createElement('div');
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add Document</h3>
                <p>Category: <strong>${category}</strong></p>
                <p>Subcategory: <strong>${subcategory}</strong></p>
                
                <div class="upload-form">
                    <label>Document Name:</label>
                    <input type="text" id="docName" placeholder="Enter document name" />
                    
                    <label>Document Link:</label>
                    <input type="url" id="docLink" placeholder="https://..." />
                    
                    <div class="modal-buttons">
                        <button onclick="documentManager.handleUpload('${category}', '${subcategory}')" class="btn-primary">
                            <i class="fas fa-check"></i> Add
                        </button>
                        <button onclick="documentManager.closeModal()" class="btn-secondary">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async handleUpload(category, subcategory) {
        const docName = document.getElementById('docName').value.trim();
        const docLink = document.getElementById('docLink').value.trim();
        
        if (!docName) {
            alert('Please enter a document name');
            return;
        }

        if (!docLink) {
            alert('Please enter a document link');
            return;
        }

        const documentData = { name: docName, link: docLink };
        const result = await this.addDocument(category, subcategory, documentData);
        
        if (result) {
            this.closeModal();
            showNotification('Document added successfully!', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            alert('Failed to add document. Please try again.');
        }
    }

    closeModal() {
        const modal = document.querySelector('.upload-modal');
        if (modal) {
            modal.remove();
        }
    }

    async renderDocuments(category, subcategory, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const docs = await this.loadDocuments(category, subcategory);
        
        docs.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'material-item uploaded-doc';
            
            docItem.innerHTML = `
                <a href="${doc.link}" target="_blank" style="text-decoration: none;">
                    <span>${doc.name}</span>
                </a>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="${doc.link}" target="_blank">
                        <button class="download-btn">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </a>
                    ${this.isAdmin ? `
                        <button class="delete-btn" onclick="documentManager.deleteDocumentConfirm(${doc.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(docItem);
        });
    }

    async deleteDocumentConfirm(docId) {
        if (confirm('Are you sure you want to delete this document?')) {
            const success = await this.deleteDocument(docId);
            
            if (success) {
                showNotification('Document deleted successfully!', 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                alert('Failed to delete document. Please try again.');
            }
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : '#3b82f6',
        color: '#fff',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const documentManager = new DocumentManager();
