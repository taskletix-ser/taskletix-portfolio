 🚀 Taskletix Website - Complete Setup Guide

A comprehensive guide to set up and run the Taskletix web agency website with contact form functionality, featuring a Flask backend API and a modern HTML/CSS/JavaScript frontend.
## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/mysql/) or use XAMPP
- **Git** - [Download Git](https://git-scm.com/downloads)

### Optional (Recommended)
- **XAMPP** - For easy MySQL management - [Download XAMPP](https://www.apachefriends.org/)
- **VS Code** - For code editing - [Download VS Code](https://code.visualstudio.com/)
## ⚡ Quick Start

If you want to get up and running quickly, follow these steps:

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd tasklitx-demo-website

# 2. Set up the backend
cd backend
pip install -r requirements.txt

# 3. Set up the frontend
cd ../frontend
npm install

# 4. Create environment file
cd ../backend
cp env_template.txt .env
# Edit .env with your MySQL credentials

# 5. Set up database
# Run the SQL commands in backend/db.sql

# 6. Start the servers
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend



## 📁 Detailed Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd tasklitx-demo-website

# Verify the project structure
ls -la
```

You should see:
```
tasklitx-demo-website/
├── backend/
├── frontend/
├── README.md
├── process.md
└── MIGRATION_GUIDE.md
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python --version
pip list
```

**Required Python Packages:**
- Flask
- Flask-CORS
- python-dotenv
- mysql-connector-python
- reportlab (for PDF export)

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
npm install

# Verify installation
node --version
npm --version
```

## 🗄️ Database Setup

### Option A: Using XAMPP (Recommended for beginners)

1. **Install XAMPP**
   - Download and install XAMPP from [apachefriends.org](https://www.apachefriends.org/)
   - Start Apache and MySQL services

2. **Access phpMyAdmin**
   - Open browser and go to: `http://localhost/phpmyadmin`
   - Create a new database: `taskletix_db`

3. **Import Database Schema**
   - Click on the `taskletix_db` database
   - Go to "Import" tab
   - Choose file: `backend/db.sql`
   - Click "Go" to import

### Option B: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Run the database setup commands
source backend/db.sql;
```

### Option C: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new database: `taskletix_db`
4. Open and execute the `backend/db.sql` file

## ⚙️ Environment Configuration

### Step 1: Create Environment File

```bash
# Navigate to backend directory
cd backend

# Copy the template file
cp env_template.txt .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your MySQL credentials:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=taskletix_db

# Admin Configuration
ADMIN_PASSWORD=your_admin_password

# Server Configuration
PORT=5000
DEBUG=True
```

**Important Notes:**
- Replace `your_mysql_password` with your actual MySQL password
- Replace `your_admin_password` with a secure admin password
- Keep the `.env` file secure and never commit it to Git
cd frontend
npm run dev
```

## 🚀 Running the Application

### Step 1: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Start the Flask server
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

### Step 2: Start the Frontend Server

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Start the development server
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:3000/
Network: http://192.168.x.x:3000/
