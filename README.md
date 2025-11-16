# Flight Booking System

A **web-based flight booking application** built with **Node.js**, **Express.js**, and **SQL databases**. This system allows users to view flights, book tickets, manage their bookings, and provides admin functionalities to manage flights and bookings.  

---

## Features

### User Features
- Register and login with secure authentication.
- Browse available flights.
- Book flight tickets.
- View and cancel own bookings.

### Admin Features
- Manage all flights (Create, Read, Update, Delete).
- View all bookings.
- Cancel any booking.

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** SQL (MySQL/PostgreSQL)
- **Templating Engine:** EJS
- **Session Management:** express-session
- **Method Override:** method-override for DELETE/PUT requests in forms
- **Security:** bcrypt for password hashing
- **Frontend:** HTML, CSS (Vanilla)

---

## Project Structure
config/ -> Configuration files (DB, env variables)
controllers/ -> Route controllers (auth, booking, flight)
models/ -> Database models
routes/ -> Express routes
views/ -> EJS templates
public/ -> Static assets (CSS, JS, images)
middleware/ -> Custom middleware (auth, logging)
data/ -> Sample JSON data (optional)
server.js -> Main Express server
.env -> Environment variables

---

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repo-url>
cd flight-booking-system

2.npm install

3.Create a .env file with your environment variables:
PORT=3000
SESSION_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=flight_booking

4.node server.js

5.Open your browser at http://localhost:3000
