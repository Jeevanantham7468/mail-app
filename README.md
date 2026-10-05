# Bulk Mail Application (MERN Stack)

A full-stack bulk email web application built using **React**, **Node.js**, **Express**, and **MongoDB**. It uses **Nodemailer** for email delivery and allows sending customized emails to multiple recipients at once, with delivery logging and history tracking.

---

## Features

- **Email Composer**:
  - Add multiple recipients via comma, semicolon, or line breaks.
  - **File Upload**: Import recipient email addresses from `.csv` or `.txt` files.
  - Instant sample emails button for quick testing.
  - Live email format validation (filters out invalid emails).
  - Rich text formatting helpers (bold, italic, buttons, lists) and live preview.
  - Realistic templates (Event invitation, Interview schedule, Team digest).
- **Email Delivery (Nodemailer)**:
  - Sends emails in small batches (chunks of 5) to prevent connection timeouts.
  - **Zero-Setup Testing**: If no custom SMTP credentials are provided, it automatically uses **Ethereal Mail** for simulated delivery and generates preview links to view sent emails in the browser.
  - Supports custom SMTP (e.g., Gmail with App Password, Outlook, custom mail servers).
- **Database (MongoDB & Mongoose)**:
  - Stores every sent email: subject, body, recipients list, delivery status (`sent`, `partial`, `failed`), and timestamp.
  - Sent history page with search by subject/email and status filter.
  - Re-use past email content in the composer with one click.
  - Real-time analytics dashboard (total sent, success rate, failed emails).
- **Admin Authentication**:
  - Secure login with JWT token and bcrypt password hashing.
  - Default demo admin account created automatically on first run (`admin@bulkmail.com` / `admin123`).

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Email Client**: Nodemailer
- **Authentication**: JSON Web Token (JWT), bcryptjs

---

## Project Structure

```
bulk-mail-app/
├── client/                  # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation bar & DB status indicator
│   │   │   ├── MailComposer.jsx      # Email form, validation, templates & upload
│   │   │   ├── MailHistory.jsx       # Sent email logs, search, and actions
│   │   │   ├── StatsDashboard.jsx    # Delivery analytics cards
│   │   │   ├── EmailDetailModal.jsx  # Inspect individual email delivery details
│   │   │   ├── SmtpSettingsModal.jsx # Configure or test custom SMTP
│   │   │   ├── AuthModal.jsx         # Admin login / registration
│   │   │   └── Toast.jsx             # Notification toasts
│   │   ├── services/
│   │   │   └── api.js                # API service helper
│   │   ├── App.jsx                   # Main React app component
│   │   └── main.jsx
│   └── package.json
│
├── server/                  # Node.js + Express Backend
│   ├── controllers/
│   │   ├── mailController.js # Send mail, history, statistics
│   │   └── authController.js # Admin authentication
│   ├── models/
│   │   ├── EmailLog.js       # MongoDB schema for email records
│   │   └── User.js           # Admin user schema
│   ├── routes/
│   │   ├── mailRoutes.js     # /api/mail endpoints
│   │   └── authRoutes.js     # /api/auth endpoints
│   ├── services/
│   │   └── mailService.js    # Nodemailer transporter and batch sending
│   ├── server.js             # Express app entry point
│   └── .env                  # Port, MongoDB URI, JWT secret
│
├── sample_recipients.csv    # Sample CSV file for testing recipient upload
├── sample_recipients.txt    # Sample TXT file for testing recipient upload
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on default port `27017` (or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd bulk-mail-app/server
npm install
npm start
```
The server will start on `http://localhost:5000` and connect to `mongodb://127.0.0.1:27017/bulk_mailer_db`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd bulk-mail-app/client
npm install
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## Demo Credentials

If you want to log in as admin:
- **Email**: `admin@bulkmail.com`
- **Password**: `admin123`

*(You can also use the app without logging in; login is optional for managing credentials).*

---

## How to Test Sending Emails

### Option A: Testing Sandbox (No Setup Required)
You don't need any real email account to test. By default, the app uses Ethereal test inbox.
1. Go to the **Compose** tab.
2. Click **"Add Sample Emails"** (or upload `sample_recipients.csv`).
3. Click **"Send Bulk Emails"**.
4. Once sent, click **"View Email Online"** to open and inspect the delivered email on the web!

### Option B: Using Real Gmail / Custom SMTP
1. Click the **Gear icon (⚙️)** in the top right.
2. Click **"Gmail Preset"** or type your SMTP host (`smtp.gmail.com`), port (`465`), and your Gmail address.
3. In the password field, enter your 16-character **Google App Password** (from your Google Account Security settings).
4. Click **"Test Connection"** to verify, then **"Save"**.
5. Your emails will now be sent to real inboxes.

---

## API Reference

### Mail Endpoints (`/api/mail`)
- `POST /api/mail/send` - Send bulk email (body: `subject`, `body`, `recipients`)
- `GET /api/mail/history` - Fetch sent email history from MongoDB
- `GET /api/mail/history/:id` - Fetch single email log by ID
- `DELETE /api/mail/history/:id` - Delete an email record
- `POST /api/mail/verify-smtp` - Test SMTP credentials
- `GET /api/mail/stats` - Get delivery analytics and success rate

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create new admin account
- `GET /api/auth/me` - Get current session info
- `PUT /api/auth/smtp-config` - Save custom SMTP settings in user profile
