**Task Manager Application Overview:The task manager application is designed to help users efficiently manage their tasks and responsibilities by providing a user-friendly interface for creating, viewing, updating, and deleting tasks. It includes essential features such as secure user authentication, allowing individuals to sign up and log in to their accounts, as well as profile management to update personal information. With built-in validation such as input field validation and email validation, the application ensures a seamless user experience while enhancing productivity and organization in both personal and professional settings. **

**This apps **contain** the following features:**

* Signup
* Login
* Logout
* Update profile
* Add tasks
* View tasks
* Update tasks
* Delete tasks

**This **app**lication** is**almost **a** precompiled** app**. However, students will develop some features,**such as adding tasks, viewing tasks, updating tasks, and **deleting** tasks**. **Students** will interact with GitHub when they develop the features.**

---

**Prerequisite:** Please install the following software and create account in following web tools** **

* **Nodejs [**[https://nodejs.org/en](https://nodejs.org/en)]** **
* **Git [**[https://git-scm.com/](https://git-scm.com/)]** **
* **VS code editor** [[https://code.visualstudio.com/](https://code.visualstudio.com/)]** **
* **MongoDB Account** [[https://account.mongodb.com/account/login](https://account.mongodb.com/account/login)]** - In tutorial, we have also showed how can you create account and database: follow step number 2.**
* **GitHub Account** [[https://github.com/signup?source=login](https://github.com/signup?source=login)]** **


A modern full-stack task management application built with React and Node.js, designed to help users efficiently organize their tasks, assignments, and events in one centralized platform.

## ✨ Features

###  Authentication & Security
- **User Registration & Login** - Secure account creation and authentication
- **JWT-based Authentication** - Token-based session management
- **Profile Management** - Update personal information and preferences
- **Secure Logout** - Proper session termination

###  Task Management
- **CRUD Operations** - Create, read, update, and delete tasks
- **Priority Levels** - Set task priorities (Low, Medium, High)
- **Deadline Tracking** - Add due dates and time management
- **Status Management** - Mark tasks as completed or pending
- **Rich Descriptions** - Detailed task descriptions and notes

###  Assignment Management
- **Project Organization** - Create and manage assignments
- **Progress Tracking** - Monitor assignment completion status
- **Workflow Management** - Organize work projects efficiently

###  Event Management
- **Event Scheduling** - Create and manage calendar events
- **Event Tracking** - Monitor upcoming and past events
- **Calendar Integration** - Seamless calendar functionality

##  Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

##  Prerequisites

Before running this application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://mongodb.com/) account
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

##  Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Taskmanager-main
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   - Create `.env` file in backend directory
   - Add your MongoDB connection string and JWT secret

5. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

## 📁 Project Structure

```
Taskmanager-main/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # React.js client application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── README.md              # Original README
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite

### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite


---

**Built with using modern web technologies**

---
