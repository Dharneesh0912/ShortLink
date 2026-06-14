# 🔗 ShortLink – Full Stack URL Shortener Platform

A modern full-stack URL Shortener application built with React, Node.js, Express, and MongoDB that allows users to create, manage, and analyze shortened URLs with authentication, analytics, QR codes, and custom aliases.

---

## 🚀 Live Project Demonstration

### 📹 YouTube Demo

https://youtu.be/Pp5VVnVVRM8?si=AGG2BwVDE1Zpla7K

### 🎥 Loom Walkthrough

https://www.loom.com/share/8755cb0a0c9a4604b8f7bfca9465c0be

---

# 📌 Project Overview

This project was developed as a full-stack engineering assessment to demonstrate practical skills in:

* Authentication & Authorization
* REST API Development
* Database Modeling
* URL Shortening Logic
* Analytics Tracking
* Frontend Dashboard Development
* Secure Backend Development
* Responsive UI/UX Design

The platform enables authenticated users to create short links, track performance metrics, generate QR codes, and manage their URLs through a modern dashboard.

---

# ✨ Features

## Authentication

* User Registration
* User Login
* JWT-based Authentication
* Protected Routes
* Secure Password Hashing using bcrypt

## URL Shortening

* Create Short URLs
* Custom Alias Support
* URL Validation
* Automatic Short Code Generation
* Copy-to-Clipboard Functionality

## Analytics

* Click Tracking
* Total Click Count
* Recent Visit History
* Last Visited Information
* Device & Visitor Tracking

## Dashboard

* Manage All User URLs
* Delete URLs
* View Analytics
* Search & Filter Links
* Responsive Data Table

## QR Code Features

* Generate QR Codes
* Download QR Codes
* Scan & Redirect

## Additional Features

* Expiry Date Support
* Bulk URL Processing
* Responsive Design
* Modern SaaS-inspired UI

---

# 🏗 Architecture

Frontend
├── React
├── Vite
├── Axios
├── React Router
└── Modern Responsive UI

Backend
├── Node.js
├── Express.js
├── JWT Authentication
├── Validation Middleware
├── Analytics Tracking
└── REST APIs

Database
└── MongoDB

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* JavaScript
* CSS

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* JWT
* bcrypt

## Utilities

* QRCode
* Axios
* Helmet
* Express Rate Limit

---

# 📂 Project Structure

```text
url-shortener/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd url-shortener
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

BASE_URL=http://localhost:5000
```

---

# 📊 Database Design

## Users Collection

```js
{
  email,
  passwordHash,
  createdAt
}
```

## URLs Collection

```js
{
  originalUrl,
  shortCode,
  customAlias,
  userId,
  totalClicks,
  expiresAt,
  createdAt
}
```

## Clicks Collection

```js
{
  shortCode,
  ipAddress,
  device,
  country,
  clickedAt
}
```

---

# 🧪 Testing Checklist

* User Signup
* User Login
* Create Short URL
* Custom Alias Creation
* Redirect Functionality
* QR Generation
* Analytics Tracking
* URL Deletion
* Protected Routes
* Error Handling

---

# 📸 Screenshots

Add screenshots here before submission:

* Login Page
* Register Page
* Dashboard
* URL Creation
* Analytics Page
* QR Code View

---

# 🔒 Security Measures

* Password Hashing (bcrypt)
* JWT Authentication
* Input Validation
* Rate Limiting
* Helmet Security Middleware
* Environment Variables

---

# 📈 Future Improvements

* Custom Domains
* Team Collaboration
* Advanced Analytics
* Link Categories
* Public API
* Export Analytics Reports

---

# 👨‍💻 Author

Kamaleesh

Full Stack Developer

---

# 📄 License

This project was created for educational and assessment purposes.
