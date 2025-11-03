# AccounTrack Pro - Accounting Case Management System

A comprehensive web-based accounting case management system that enables clients to create cases and administrators to manage tasks, attachments, and communicate through an integrated chat system.

## 🎯 Project Overview

AccounTrack Pro is a complete accounting case management solution designed to streamline the workflow between accounting firms and their clients. The system provides separate interfaces for clients and administrators, enabling efficient case creation, task allocation, document management, and real-time communication.

## ✨ Main Features

### Client Portal
- **Create New Cases**: Submit accounting service requests with detailed information
- **View Case Status**: Monitor case progress in real-time
- **Case Details**: View assigned tasks, attachments, and communicate via chat
- **Search & Filter**: Find cases by name, email, company, or status
- **Priority Levels**: Set case priority (Low, Medium, High, Urgent)

### Admin Dashboard
- **Case Management**: View and manage all client cases in one place
- **Task Allocation**: Create and assign step-by-step tasks for each case
- **Status Tracking**: Update case status (Pending, In Progress, Completed, On Hold)
- **Advanced Filtering**: Filter cases by status, priority, or search criteria
- **Comprehensive Case View**: Access all case information, tasks, attachments, and chat in one interface

### Task Management System
- **Step-by-Step Tasks**: Create sequential tasks with order numbers
- **Task Status Updates**: Track tasks through Pending → In Progress → Completed states
- **Task Details**: Add descriptions, due dates, and assignment information
- **Visual Indicators**: Color-coded task states for quick identification
- **Task Actions**: Start, complete, or block tasks with one click

### Attachment Management
- **File Upload**: Upload multiple files per case
- **File Types Support**: PDF, Word, Excel, images, and more
- **File Information**: View file name, size, type, and upload date
- **Download Files**: Download attachments directly from the system
- **Uploader Tracking**: Track who uploaded each file (client or admin)

### Chat System
- **Real-time Communication**: Chat between clients and administrators
- **Auto-refresh**: Messages update automatically every 3 seconds
- **Message History**: View complete conversation history
- **Sender Identification**: Clear distinction between client and admin messages
- **Timestamps**: Date and time stamps for all messages

## 🗂️ Data Models

### Cases Table
- **id**: Unique case identifier
- **client_name**: Client full name
- **client_email**: Client email address
- **client_phone**: Client phone number
- **company_name**: Company name (optional)
- **case_type**: Service type (Tax Filing, Company Opening, Bookkeeping, etc.)
- **status**: Case status (pending, in_progress, completed, on_hold)
- **description**: Detailed case description
- **priority**: Priority level (low, medium, high, urgent)
- **assigned_to**: Admin/accountant assigned
- **created_date**: Case creation timestamp

### Tasks Table
- **id**: Unique task identifier
- **case_id**: Associated case ID
- **task_name**: Task title
- **task_description**: Detailed task description
- **status**: Task status (pending, in_progress, completed, blocked)
- **step_order**: Sequential order number
- **assigned_by**: Admin who created the task
- **due_date**: Task deadline
- **completed_date**: Task completion timestamp

### Attachments Table
- **id**: Unique attachment identifier
- **case_id**: Associated case ID
- **task_id**: Associated task ID (optional)
- **file_name**: Original file name
- **file_url**: File data (base64 encoded)
- **file_type**: MIME type
- **file_size**: File size in bytes
- **uploaded_by**: Uploader type (client/admin)
- **upload_date**: Upload timestamp

### Messages Table
- **id**: Unique message identifier
- **case_id**: Associated case ID
- **sender_name**: Message sender name
- **sender_type**: Sender type (client/admin)
- **message_text**: Message content
- **timestamp**: Message timestamp
- **is_read**: Read status flag

## 🚀 Currently Implemented Features

✅ **Complete Client Portal**
- New case creation form with validation
- My cases view with search and filtering
- Case detail modal with full information

✅ **Complete Admin Dashboard**
- All cases table view with sorting
- Advanced filtering (status, priority, search)
- Case management interface

✅ **Full Task Management**
- Add new tasks with step order
- Update task status (pending, in progress, completed, blocked)
- Task listing with visual indicators
- Due date tracking

✅ **Attachment System**
- Multiple file upload
- File download functionality
- File type icons and metadata display
- Base64 file storage

✅ **Chat Functionality**
- Send and receive messages
- Auto-refresh every 3 seconds
- Message history display
- Sender type identification

✅ **Responsive Design**
- Mobile-friendly interface
- Professional styling
- Modern UI/UX with Font Awesome icons
- Color-coded status badges

✅ **RESTful API Integration**
- Complete CRUD operations for all tables
- Filtering and pagination support
- Error handling and notifications

## 📋 Features Not Yet Implemented

⏳ **User Authentication**
- Login system for clients and admins
- Role-based access control
- User profiles and settings

⏳ **Email Notifications**
- Case status change notifications
- New task assignment alerts
- New message notifications

⏳ **Advanced Reporting**
- Case analytics and statistics
- Task completion metrics
- Response time tracking

⏳ **Calendar Integration**
- Task deadline calendar view
- Appointment scheduling
- Reminder system

⏳ **Document Templates**
- Pre-filled form templates
- Document generation
- E-signature support

⏳ **Bulk Operations**
- Bulk case updates
- Mass task assignment
- Export data to Excel/PDF

## 🔧 Recommended Next Steps

1. **Implement User Authentication**
   - Add login/logout functionality
   - Create user registration system
   - Implement password reset feature
   - Add session management

2. **Enhance Search Functionality**
   - Add full-text search
   - Implement advanced filters
   - Create saved search views
   - Add export search results

3. **Add Email Integration**
   - Set up email notifications
   - Create email templates
   - Implement automated reminders
   - Add email-to-case feature

4. **Improve File Management**
   - Add file preview functionality
   - Implement cloud storage integration
   - Add file versioning
   - Create file sharing links

5. **Expand Reporting**
   - Create dashboard with KPIs
   - Add custom report builder
   - Implement data visualization
   - Export reports to PDF/Excel

6. **Mobile App Development**
   - Create native mobile apps
   - Add push notifications
   - Implement offline mode
   - Mobile-optimized workflows

## 🌐 Functional Entry URIs

### Client Portal
- **Main Entry**: `/` or `/index.html`
  - Default view: Client Portal → New Case section
  - Switch to "My Cases" to view all cases

### Admin Dashboard
- **Access**: Click "Admin Dashboard" tab in header
  - Default view: All Cases table
  - Click any case to view details and manage tasks

### Case Management
- **Create Case**: Client Portal → New Case → Fill form → Submit
- **View Cases**: Client Portal → My Cases (client view) or Admin Dashboard → All Cases (admin view)
- **Case Details**: Click any case card or table row
- **Update Status**: Admin Dashboard → Case Details → Change status dropdown

### Task Management
- **Add Task**: Case Details Modal → Tasks section → "Add Task" button
- **Update Task**: Case Details Modal → Click task action buttons (Start, Complete, Block)

### Attachments
- **Upload Files**: Case Details Modal → Attachments section → "Upload" button
- **Download Files**: Case Details Modal → Attachments list → Click download button

### Chat
- **Send Message**: Case Details Modal → Chat panel → Type message → Send
- **View Messages**: Case Details Modal → Chat panel (auto-refreshes every 3 seconds)

## 🎨 Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Client-side functionality and API integration
- **Font Awesome**: Icon library for UI elements
- **Google Fonts (Inter)**: Typography
- **RESTful Table API**: Backend data persistence

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1400px+)
- Laptop (1024px - 1399px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔐 Data Storage

All data is stored using the RESTful Table API with the following endpoints:

- `GET /tables/{table}` - List records with pagination
- `GET /tables/{table}/{id}` - Get single record
- `POST /tables/{table}` - Create new record
- `PUT /tables/{table}/{id}` - Update record (full)
- `PATCH /tables/{table}/{id}` - Update record (partial)
- `DELETE /tables/{table}/{id}` - Delete record (soft delete)

## 📊 Service Types Supported

- Tax Filing
- Company Opening
- Bookkeeping
- Audit
- Payroll
- Financial Consulting
- VAT Registration
- Other (custom services)

## 🎯 User Workflow Examples

### Client Workflow
1. Access Client Portal
2. Fill out "New Case" form with service details
3. Submit case and wait for admin assignment
4. Check "My Cases" to monitor progress
5. Click case to view assigned tasks
6. Upload required documents in Attachments
7. Communicate with admin via Chat
8. Track task completion and case status

### Admin Workflow
1. Access Admin Dashboard
2. View all pending cases in the table
3. Click a case to open details
4. Update case status to "In Progress"
5. Create step-by-step tasks (e.g., Step 1: Tax Filing, Step 2: Company Opening)
6. Add due dates and descriptions
7. Monitor client uploads in Attachments
8. Communicate updates via Chat
9. Update task statuses as work progresses
10. Mark case as "Completed" when done

## 🎨 UI Features

- **Color-coded Status Badges**: Visual identification of case and task states
- **Priority Indicators**: Clear priority markers (Low, Medium, High, Urgent)
- **Modal Windows**: Clean overlay interfaces for case details
- **Real-time Notifications**: Toast messages for user actions
- **Smooth Animations**: Professional transitions and hover effects
- **Loading States**: Visual feedback for data operations
- **Empty States**: Helpful messages when no data exists

## 🔄 Auto-refresh Features

- Chat messages: Auto-refresh every 3 seconds when case modal is open
- Manual refresh available by clicking case again

## 📁 Project Structure

```
AccounTrack-Pro/
├── START_HERE.html            # ⭐ Welcome page - Start here!
├── index.html                 # Main application file
├── setup-sample-data.html     # Sample data setup utility
├── README.md                  # Complete documentation
├── QUICK_START.md            # Quick start guide
├── FEATURES.md               # Features checklist
├── DEPLOYMENT.md             # Deployment guide
├── PROJECT_SUMMARY.md        # Technical overview
├── DOCUMENTATION_INDEX.md    # Documentation navigation
├── css/
│   └── style.css             # All styles and responsive design
└── js/
    └── app.js                # Application logic and API integration
```

## 📝 Notes

- **File Storage**: Attachments are stored as base64-encoded data (suitable for small to medium files)
- **Real-time Updates**: Chat polling provides near-real-time communication
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **No Backend Required**: Fully static with API integration

## 🚀 Getting Started

### ⭐ Brand New? Start Here!

Open **`START_HERE.html`** in your web browser for a beautiful welcome page with guided navigation.

### First Time Setup (with Sample Data)

1. Open `setup-sample-data.html` in a web browser
2. Click "Setup Sample Data" button to link sample cases, tasks, and messages
3. Wait for confirmation and automatic redirect to `index.html`
4. Explore the system with pre-loaded sample data

### Regular Usage

1. Open `index.html` in a web browser
2. Start with Client Portal to create a new case
3. Switch to Admin Dashboard to manage cases
4. Click any case to access full details, tasks, attachments, and chat

### Sample Data Included

The system includes sample data to help you explore features:
- **4 Sample Cases**: Various service types and statuses
- **4 Sample Tasks**: Step-by-step tasks for Tax Filing case
- **3 Sample Messages**: Client-admin conversation example

## 📚 Additional Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute quick start guide
- **[FEATURES.md](FEATURES.md)** - Complete features checklist
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment and maintenance guide

## 🎓 Support

For questions or issues, use the chat feature within any case to communicate between clients and administrators.

## 📞 Technical Support

- Review documentation files for detailed guides
- Check browser console for error messages
- Verify API endpoints are accessible
- Test with sample data using `setup-sample-data.html`

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: Production Ready ✅
