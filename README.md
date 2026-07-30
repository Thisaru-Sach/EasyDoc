# 🏥 EasyDoc - Full-Stack Healthcare Management Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen)]()

**EasyDoc** is a full-stack appointment scheduling and healthcare management platform built using the **PERN stack** (PostgreSQL, Express.js, React, Node.js). The application enables patients to search for medical specialists and book appointments, doctors to manage their schedules, and system administrators to provision staff credentials.

---

## 🚀 Features

### 👤 Patient Portal
* **Account Registration & Authentication:** Secure JWT-based login and registration system.
* **Doctor Search & Filtering:** Filter doctors by specialty, location, or name.
* **Appointment Booking:** Real-time slot reservation with automated **overbooking validation** to prevent double booking.
* **Appointment Management:** View upcoming/past visits and cancel scheduled appointments.
* **Live Dashboard Notifications:** Instant alert badges updating patients when an appointment is confirmed or declined.

### 🩺 Doctor Portal
* **Schedule Overview:** Dedicated dashboard displaying patient appointments and upcoming time slots.
* **Status Controls:** Confirm (approve) or decline patient appointment requests.
* **Next Appointment Banner:** Real-time notification displaying the doctor's immediate next patient slot.

### 🛡️ Admin Portal
* **Staff Provisioning:** Provision new Doctor and Admin accounts securely.
* **Automated Emailing:** Integration with Nodemailer to dispatch login credentials to newly created staff accounts upon creation.
* **System Metrics:** Access and audit registered users across all system roles.

### 🔐 Security & Password Recovery
* **Self-Service Password Reset:** Integrated 6-digit OTP verification delivered via email (valid for 5 minutes).
* **Role-Based Access Control (RBAC):** Middleware protecting backend endpoints (`patient`, `doctor`, `admin`).
* **Authenticated Settings:** Change password modal accessible directly from the navigation bar.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React (Vite), Bootstrap 5, React Router, Context API
* **Backend:** Node.js, Express.js, RESTful API architecture
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (JWT), Bcrypt password hashing
* **Email Services:** Nodemailer (SMTP)

---

## 📁 Repository Structure

```text
EasyDoc/
├── easydoc-backend/         # Express.js API & Database connection
│   ├── config/              # Database pool & Nodemailer config
│   ├── middleware/          # JWT auth & RBAC authorization
│   ├── routes/              # Auth, Appointment, Admin, and User routes
│   ├── server.js            # Express server entry point
│   └── package.json
├── easydoc-frontend/        # React SPA built with Vite
│   ├── src/
│   │   ├── components/      # Modals, Navbar, Notifications
│   │   ├── context/         # AuthContext state management
│   │   ├── pages/           # Patient, Doctor, Admin, and Auth views
│   │   └── App.jsx
│   └── package.json
├── .gitignore
└── README.md