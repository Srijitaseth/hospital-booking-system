# OR Flow - Surgical Booking System

OR Flow is a high-concurrency clinical appointment booking system designed to simulate real-world hospital scheduling. It features a professional patient portal for finding doctors and an admin command center for managing hospital resources.

The system is engineered to handle race conditions and overbooking using PostgreSQL row-level locking (FOR UPDATE) and manages booking expiry via a Redis job queue.

---

## Live Demo
* **Frontend (Patient/Admin Portal):** [INSERT YOUR VERCEL LINK HERE]
* **Backend API:** [INSERT YOUR RENDER LINK HERE]

---

## Tech Stack

### Backend (or-flow-backend)
* **Runtime:** Node.js & Express
* **Language:** TypeScript
* **Database:** PostgreSQL (Sequelize ORM)
* **Concurrency:** Pessimistic Locking (Row-Level transactions)
* **Queue:** Redis (Bull) for job scheduling

### Frontend (or-flow-frontend)
* **Framework:** React (Vite)
* **Language:** TypeScript
* **Styling:** Professional CSS Variables & Flexbox/Grid
* **State Management:** React Context API
* **HTTP Client:** Axios

---

## Project Structure

healthflow-app/
├── or-flow-backend/           # Server-side Code
│   ├── src/
│   │   ├── config/            # DB & Redis Configuration
│   │   ├── models/            # Sequelize Models (Slot, Booking, Equipment)
│   │   ├── routes/            # API Route Definitions
│   │   ├── services/          # Concurrency Logic (Locking mechanism)
│   │   ├── workers/           # Background Jobs (Expiry Worker)
│   │   └── app.ts             # Entry point
│   └── package.json
│
└── or-flow-frontend/          # Client-side Code
    ├── src/
    │   ├── api/               # Axios API calls
    │   ├── context/           # Global State (Slots Data)
    │   ├── pages/             # SlotList, BookingPage, AdminDashboard
    │   ├── types/             # TypeScript Interfaces
    │   └── main.tsx           # Entry point
    └── package.json

---

## Setup Instructions

### Prerequisites
* Node.js (v18+)
* PostgreSQL
* Redis (Required for the expiry feature)

### 1. Database Setup
Create a PostgreSQL database named or_flow_db.

CREATE DATABASE or_flow_db;

### 2. Backend Installation

cd or-flow-backend

# Install dependencies
npm install

# Create a .env file
echo "DB_URL=postgres://user:pass@localhost:5432/or_flow_db" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env
echo "PORT=5001" >> .env

# Run the server
npm run dev

The backend runs on http://localhost:5001.

### 3. Frontend Installation
Open a new terminal:

cd or-flow-frontend

# Install dependencies
npm install

# Run the development server
npm run dev

The frontend runs on http://localhost:5173.

---

## API Documentation

### Admin Endpoints

#### 1. Seed Database (Reset System)
Populates the database with professional clinical data (Doctors, Rooms, Equipment).
* **Endpoint:** POST /api/seed
* **Response:** 200 OK

#### 2. Get All Bookings (Admin Report)
Returns a list of all bookings including status and patient details.
* **Endpoint:** GET /api/admin/bookings
* **Response:** 200 OK (Array of Bookings)

#### 3. Create Slot
Manually schedule a new surgery slot.
* **Endpoint:** POST /api/admin/slots
* **Body:**
    {
      "doctor_name": "Dr. House",
      "procedure_type": "Diagnostics",
      "room_id": 1,
      "start_time": "2025-12-12T09:00:00Z",
      "end_time": "2025-12-12T11:00:00Z"
    }

---

### Patient Endpoints

#### 1. Get Available Slots
Fetch all open slots. Includes details on required equipment and room info.
* **Endpoint:** GET /api/slots
* **Response:** 200 OK (Array of Slots)

#### 2. Create Booking (High Concurrency)
Attempts to book a slot. This endpoint uses PostgreSQL Locking to prevent double-booking.
* **Endpoint:** POST /api/bookings
* **Body:**
    {
      "slotId": 1,
      "patientId": 12345
    }
* **Responses:**
    * 201 Created: Booking Successful (Status: PENDING)
    * 409 Conflict: Room already booked OR Insufficient Equipment.

#### 3. Get Booking Status
Check if a booking is CONFIRMED or FAILED.
* **Endpoint:** GET /api/bookings/:id

---

## Architecture & Scalability

### Concurrency Control
The system prevents race conditions (e.g., two users booking the last ventilator at the exact same millisecond) using Pessimistic Locking.
1.  **Transaction Start:** A DB transaction begins.
2.  **Lock:** SELECT * FROM or_slots FOR UPDATE locks the slot row.
3.  **Check:** The system checks for existing bookings and equipment inventory while holding the lock.
4.  **Commit/Rollback:** If valid, the booking is inserted; otherwise, the transaction rolls back.

### Asynchronous Queue
To keep the API fast, booking expiry is handled asynchronously.
* **Bull Queue (Redis):** When a booking is created (PENDING), a job is delayed for 2 minutes.
* **Worker:** A background worker processes the job. If the booking is not confirmed by then, it is marked as FAILED.

---

## Authors
* **[Your Name]** - Full Stack Development