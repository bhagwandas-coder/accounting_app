// Global State
let currentView = 'client';
let currentSection = 'new-case';
let selectedCaseId = null;
let currentChatCaseId = null;
let chatInterval = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadInitialData();
}

// Event Listeners Setup
function setupEventListeners() {
    // View Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Sub Navigation
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    // New Case Form
    document.getElementById('new-case-form').addEventListener('submit', handleNewCaseSubmit);

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });

    // Add Task Button and Form
    document.getElementById('add-task-btn').addEventListener('click', showAddTaskModal);
    document.getElementById('add-task-form').addEventListener('submit', handleAddTaskSubmit);

    // Attachment Upload
    document.getElementById('attachment-upload').addEventListener('change', handleAttachmentUpload);

    // Chat
    document.getElementById('send-message-btn').addEventListener('click', sendChatMessage);
    document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Search and Filters
    document.getElementById('client-case-search').addEventListener('input', () => loadClientCases());
    document.getElementById('client-status-filter').addEventListener('change', () => loadClientCases());
    document.getElementById('admin-case-search').addEventListener('input', () => loadAdminCases());
    document.getElementById('admin-status-filter').addEventListener('change', () => loadAdminCases());
    document.getElementById('admin-priority-filter').addEventListener('change', () => loadAdminCases());
}

// View and Section Switching
function switchView(view) {
    currentView = view;
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
    });
    
    // Update view containers
    document.querySelectorAll('.view-container').forEach(container => {
        container.classList.toggle('active', container.id === `${view}-view`);
    });
    
    // Load data for the view
    if (view === 'client') {
        loadClientCases();
    } else if (view === 'admin') {
        loadAdminCases();
    }
}

function switchSection(section) {
    currentSection = section;
    
    // Get parent view
    const viewId = currentView === 'client' ? 'client-view' : 'admin-view';
    const view = document.getElementById(viewId);
    
    // Update sub nav buttons
    view.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    
    // Update content sections
    view.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    view.querySelector(`#${section}-section`).classList.add('active');
    
    // Load data for the section
    if (section === 'my-cases') {
        loadClientCases();
    } else if (section === 'all-cases') {
        loadAdminCases();
    } else if (section === 'case-details' && selectedCaseId) {
        loadCaseDetails(selectedCaseId);
    }
}

// Initial Data Load
async function loadInitialData() {
    await loadClientCases();
}

// Case Management Functions
async function handleNewCaseSubmit(e) {
    e.preventDefault();
    
    const caseData = {
        client_name: document.getElementById('client-name').value,
        client_email: document.getElementById('client-email').value,
        client_phone: document.getElementById('client-phone').value,
        company_name: document.getElementById('company-name').value,
        case_type: document.getElementById('case-type').value,
        priority: document.getElementById('case-priority').value,
        description: document.getElementById('case-description').value,
        status: 'pending',
        assigned_to: '',
        created_date: new Date().toISOString()
    };
    
    try {
        const response = await fetch('tables/cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData)
        });
        
        if (response.ok) {
            showNotification('Case created successfully!', 'success');
            document.getElementById('new-case-form').reset();
            
            // Switch to my cases
            switchSection('my-cases');
        } else {
            showNotification('Failed to create case. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating case:', error);
        showNotification('An error occurred. Please try again.', 'error');
    }
}

async function loadClientCases() {
    const search = document.getElementById('client-case-search').value;
    const status = document.getElementById('client-status-filter').value;
    
    try {
        let url = 'tables/cases?limit=100&sort=-created_at';
        
        const response = await fetch(url);
        const result = await response.json();
        
        let cases = result.data || [];
        
        // Apply client-side filtering
        if (search) {
            cases = cases.filter(c => 
                c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.client_email?.toLowerCase().includes(search.toLowerCase()) ||
                c.company_name?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (status) {
            cases = cases.filter(c => c.status === status);
        }
        
        displayClientCases(cases);
    } catch (error) {
        console.error('Error loading cases:', error);
        showNotification('Failed to load cases', 'error');
    }
}

function displayClientCases(cases) {
    const container = document.getElementById('client-cases-list');
    
    if (cases.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-folder-open"></i>
                <p>No cases found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cases.map(caseItem => `
        <div class="case-card" onclick="openCaseModal('${caseItem.id}')">
            <div class="case-card-header">
                <div class="case-card-title">${caseItem.case_type}</div>
                <span class="case-badge ${caseItem.status}">${formatStatus(caseItem.status)}</span>
            </div>
            <div class="case-card-body">
                <p><i class="fas fa-user"></i> ${caseItem.client_name}</p>
                <p><i class="fas fa-envelope"></i> ${caseItem.client_email}</p>
                ${caseItem.company_name ? `<p><i class="fas fa-building"></i> ${caseItem.company_name}</p>` : ''}
                <p><i class="fas fa-calendar"></i> ${formatDate(caseItem.created_date)}</p>
            </div>
            <div class="case-card-footer">
                <span class="priority-badge ${caseItem.priority}">${caseItem.priority}</span>
                <span class="text-muted"><i class="fas fa-clock"></i> ${getTimeAgo(caseItem.created_date)}</span>
            </div>
        </div>
    `).join('');
}

async function loadAdminCases() {
    const search = document.getElementById('admin-case-search').value;
    const status = document.getElementById('admin-status-filter').value;
    const priority = document.getElementById('admin-priority-filter').value;
    
    try {
        let url = 'tables/cases?limit=100&sort=-created_at';
        
        const response = await fetch(url);
        const result = await response.json();
        
        let cases = result.data || [];
        
        // Apply client-side filtering
        if (search) {
            cases = cases.filter(c => 
                c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.client_email?.toLowerCase().includes(search.toLowerCase()) ||
                c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.case_type?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (status) {
            cases = cases.filter(c => c.status === status);
        }
        
        if (priority) {
            cases = cases.filter(c => c.priority === priority);
        }
        
        displayAdminCases(cases);
    } catch (error) {
        console.error('Error loading cases:', error);
        showNotification('Failed to load cases', 'error');
    }
}

function displayAdminCases(cases) {
    const container = document.getElementById('admin-cases-list');
    
    if (cases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No cases found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Client Name</th>
                    <th>Case Type</th>
                    <th>Company</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${cases.map(caseItem => `
                    <tr onclick="openCaseModal('${caseItem.id}')">
                        <td>
                            <strong>${caseItem.client_name}</strong><br>
                            <small class="text-muted">${caseItem.client_email}</small>
                        </td>
                        <td>${caseItem.case_type}</td>
                        <td>${caseItem.company_name || '-'}</td>
                        <td><span class="priority-badge ${caseItem.priority}">${caseItem.priority}</span></td>
                        <td><span class="case-badge ${caseItem.status}">${formatStatus(caseItem.status)}</span></td>
                        <td>${formatDate(caseItem.created_date)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openCaseModal('${caseItem.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function openCaseModal(caseId) {
    selectedCaseId = caseId;
    currentChatCaseId = caseId;
    
    try {
        // Fetch case details
        const response = await fetch(`tables/cases/${caseId}`);
        const caseData = await response.json();
        
        // Update modal title
        document.getElementById('modal-case-title').innerHTML = 
            `<i class="fas fa-folder"></i> ${caseData.case_type} - ${caseData.client_name}`;
        
        // Display case information
        displayCaseInfo(caseData);
        
        // Load related data
        await Promise.all([
            loadCaseTasks(caseId),
            loadCaseAttachments(caseId),
            loadCaseMessages(caseId)
        ]);
        
        // Show modal
        document.getElementById('case-modal').classList.add('active');
        
        // Start chat polling
        startChatPolling(caseId);
        
    } catch (error) {
        console.error('Error loading case:', error);
        showNotification('Failed to load case details', 'error');
    }
}

function displayCaseInfo(caseData) {
    const container = document.getElementById('modal-case-info');
    
    container.innerHTML = `
        <div class="case-info-grid">
            <div class="info-item">
                <span class="info-label"><i class="fas fa-user"></i> Client Name</span>
                <span class="info-value">${caseData.client_name}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-envelope"></i> Email</span>
                <span class="info-value">${caseData.client_email}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-phone"></i> Phone</span>
                <span class="info-value">${caseData.client_phone}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-building"></i> Company</span>
                <span class="info-value">${caseData.company_name || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-briefcase"></i> Service Type</span>
                <span class="info-value">${caseData.case_type}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-flag"></i> Priority</span>
                <span class="info-value"><span class="priority-badge ${caseData.priority}">${caseData.priority}</span></span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-info-circle"></i> Status</span>
                <span class="info-value">
                    <select onchange="updateCaseStatus('${caseData.id}', this.value)" class="status-select">
                        <option value="pending" ${caseData.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${caseData.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${caseData.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="on_hold" ${caseData.status === 'on_hold' ? 'selected' : ''}>On Hold</option>
                    </select>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-calendar"></i> Created</span>
                <span class="info-value">${formatDate(caseData.created_date)}</span>
            </div>
            <div class="info-item full-width">
                <span class="info-label"><i class="fas fa-align-left"></i> Description</span>
                <span class="info-value">${caseData.description}</span>
            </div>
        </div>
    `;
}

async function updateCaseStatus(caseId, newStatus) {
    try {
        const response = await fetch(`tables/cases/${caseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification('Status updated successfully', 'success');
            // Reload cases
            if (currentView === 'client') {
                loadClientCases();
            } else {
                loadAdminCases();
            }
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Failed to update status', 'error');
    }
}

// Task Management
async function loadCaseTasks(caseId) {
    try {
        const response = await fetch(`tables/tasks?limit=100`);
        const result = await response.json();
        
        const tasks = (result.data || [])
            .filter(task => task.case_id === caseId)
            .sort((a, b) => a.step_order - b.step_order);
        
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasks-list');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks assigned yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.status}">
            <div class="task-header">
                <div class="task-title">
                    <span class="task-step">${task.step_order}</span>
                    ${task.task_name}
                </div>
                <span class="case-badge ${task.status}">${formatStatus(task.status)}</span>
            </div>
            <div class="task-description">${task.task_description}</div>
            <div class="task-meta">
                ${task.assigned_by ? `<span><i class="fas fa-user-tie"></i> ${task.assigned_by}</span>` : ''}
                ${task.due_date ? `<span><i class="fas fa-calendar"></i> Due: ${formatDate(task.due_date)}</span>` : ''}
            </div>
            <div class="task-actions">
                ${task.status !== 'completed' ? `
                    <button class="btn btn-sm btn-success" onclick="updateTaskStatus('${task.id}', 'completed')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : ''}
                ${task.status === 'pending' ? `
                    <button class="btn btn-sm btn-primary" onclick="updateTaskStatus('${task.id}', 'in_progress')">
                        <i class="fas fa-play"></i> Start
                    </button>
                ` : ''}
                ${task.status !== 'blocked' ? `
                    <button class="btn btn-sm btn-danger" onclick="updateTaskStatus('${task.id}', 'blocked')">
                        <i class="fas fa-ban"></i> Block
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showAddTaskModal() {
    document.getElementById('task-modal').classList.add('active');
}

async function handleAddTaskSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        case_id: selectedCaseId,
        task_name: document.getElementById('task-name').value,
        task_description: document.getElementById('task-description').value,
        step_order: parseInt(document.getElementById('task-order').value),
        assigned_by: document.getElementById('task-assigned-by').value,
        due_date: document.getElementById('task-due-date').value || null,
        status: 'pending',
        completed_date: null
    };
    
    try {
        const response = await fetch('tables/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            showNotification('Task added successfully!', 'success');
            document.getElementById('add-task-form').reset();
            document.getElementById('task-modal').classList.remove('active');
            await loadCaseTasks(selectedCaseId);
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Failed to add task', 'error');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const updateData = { status: newStatus };
        
        if (newStatus === 'completed') {
            updateData.completed_date = new Date().toISOString();
        }
        
        const response = await fetch(`tables/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            showNotification('Task updated successfully', 'success');
            await loadCaseTasks(selectedCaseId);
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task', 'error');
    }
}

// Attachment Management
async function handleAttachmentUpload(e) {
    const files = e.target.files;
    
    if (files.length === 0) return;
    
    for (const file of files) {
        try {
            // Convert file to base64
            const base64 = await fileToBase64(file);
            
            const attachmentData = {
                case_id: selectedCaseId,
                task_id: '',
                file_name: file.name,
                file_url: base64,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: currentView === 'admin' ? 'admin' : 'client',
                upload_date: new Date().toISOString()
            };
            
            const response = await fetch('tables/attachments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attachmentData)
            });
            
            if (response.ok) {
                showNotification(`${file.name} uploaded successfully!`, 'success');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification(`Failed to upload ${file.name}`, 'error');
        }
    }
    
    // Reset input and reload attachments
    e.target.value = '';
    await loadCaseAttachments(selectedCaseId);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function loadCaseAttachments(caseId) {
    try {
        const response = await fetch(`tables/attachments?limit=100`);
        const result = await response.json();
        
        const attachments = (result.data || []).filter(att => att.case_id === caseId);
        
        displayAttachments(attachments);
    } catch (error) {
        console.error('Error loading attachments:', error);
    }
}

function displayAttachments(attachments) {
    const container = document.getElementById('attachments-list');
    
    if (attachments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paperclip"></i>
                <p>No attachments yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = attachments.map(att => `
        <div class="attachment-item">
            <div class="attachment-icon">
                <i class="fas ${getFileIcon(att.file_type)}"></i>
            </div>
            <div class="attachment-info">
                <div class="attachment-name">${att.file_name}</div>
                <div class="attachment-meta">
                    ${formatFileSize(att.file_size)} • ${att.uploaded_by} • ${formatDate(att.upload_date)}
                </div>
            </div>
            <div class="attachment-actions">
                <button class="btn btn-sm btn-primary" onclick="downloadAttachment('${att.file_url}', '${att.file_name}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function downloadAttachment(fileUrl, fileName) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Chat Functions
async function loadCaseMessages(caseId) {
    try {
        const response = await fetch(`tables/messages?limit=100`);
        const result = await response.json();
        
        const messages = (result.data || [])
            .filter(msg => msg.case_id === caseId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages(messages) {
    const container = document.getElementById('chat-messages');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="chat-message ${msg.sender_type}">
            <div class="chat-message-header">
                <strong>${msg.sender_name}</strong>
                <span class="chat-timestamp">${formatDateTime(msg.timestamp)}</span>
            </div>
            <div class="chat-bubble">${msg.message_text}</div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentChatCaseId) return;
    
    const messageData = {
        case_id: currentChatCaseId,
        sender_name: currentView === 'admin' ? 'Admin' : 'Client',
        sender_type: currentView === 'admin' ? 'admin' : 'client',
        message_text: messageText,
        timestamp: new Date().toISOString(),
        is_read: false
    };
    
    try {
        const response = await fetch('tables/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        
        if (response.ok) {
            input.value = '';
            await loadCaseMessages(currentChatCaseId);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');
    }
}

function startChatPolling(caseId) {
    // Clear existing interval
    if (chatInterval) {
        clearInterval(chatInterval);
    }
    
    // Poll for new messages every 3 seconds
    chatInterval = setInterval(() => {
        if (currentChatCaseId === caseId) {
            loadCaseMessages(caseId);
        }
    }, 3000);
}

function stopChatPolling() {
    if (chatInterval) {
        clearInterval(chatInterval);
        chatInterval = null;
    }
}

// Modal Functions
function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    stopChatPolling();
    selectedCaseId = null;
    currentChatCaseId = null;
}

// Utility Functions
function formatStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeAgo(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'fa-file-archive';
    return 'fa-file';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
