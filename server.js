const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const helmet = require("helmet");       // NEW: Security

const http = require("http");           // NEW: HTTP Server
const https = require("https");         // NEW: HTTPS Server
const fs = require("fs");               // NEW: File System (for certs)
const mongoose = require('mongoose');   // NEW: MongoDB
const { connectMongo, AuditLog } = require('./config/mongo'); // NEW: MongoDB Config
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- 0. Database Connection (MongoDB) ---
connectMongo();

// --- 1. Middleware ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Static files (Pictures/CSS) are exposed first. This will fix the picture issue.
app.use(express.static(path.join(__dirname, "public"))); 
app.use(helmet()); // NEW: Sets security headers

// FIX: Helmet ko configure karein taaki woh online pictures ko allow karein
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Default policy self hai
            imgSrc: ["'self'", "data:", "https:", "*"], // FIX: HTTPS/data URL (base64) aur sabhi online sources ('*') ko allow karein.
            scriptSrc: ["'self'", "https:", "'unsafe-inline'"], // Agar koi inline script hai toh
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],  // Agar koi inline style hai toh
        },
    },
}));


// Support HTML forms with _method override (e.g., DELETE)
app.use((req, res, next) => {
    if (req.method === "POST" && req.body && req.body._method) {
        req.method = String(req.body._method).toUpperCase();
        delete req.body._method;
    }
    return next();
});

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Localhost pe false
        maxAge: 1000 * 60 * 60 
    }
}));

// User info for views
app.use((req, res, next) => { res.locals.user = req.session?.user; next(); });

// --- 2. Audit Logging Middleware (MongoDB) ---
// Replaces your 'Simple logger middleware'
app.use((req, res, next) => {
    // Only log non-GET requests if MongoDB is connected
    if (req.method !== 'GET' && mongoose.connection.readyState === 1) {
        const userEmail = req.session?.user?.email || 'Guest';
        AuditLog.create({ 
            action: `${req.method} request to ${req.url}`,
            user: userEmail 
        }).catch(() => {});
    }
    next();
});

// --- 3. Routes ---
const authRoutes = require("./routes/authRoutes");
const flightRoutes = require("./routes/flightRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/", authRoutes);
app.use("/", flightRoutes);
app.use("/", bookingRoutes);

// Home Route (Requires Auth, and uses 'index.ejs')
const { requireAuth } = require("./middleware/authMiddleware");
const { listFlights } = require("./models/flightModel");
app.get("/", requireAuth, async (req, res) => {
    try {
        const flights = (await listFlights()).slice(0, 6);
        res.render("index", { 
            title: "Home", 
            flights, 
            user: req.session.user // FIX: User object passed to view
        });
    } catch (e) {
        console.error("Home Page DB Error:", e.message);
        res.status(500).send("Server error fetching flights.");
    }
});

// 404 Handler
app.use((req, res) => { 
    res.status(404).render("404", { title: "Not Found" }); // Best practice: render a 404 page
});

// --- 4. Server Start (HTTPS/TLS with HTTP Fallback) ---
let server;
// Check for self-signed SSL certificate files
if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
    server = https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app);
    server.listen(PORT, () => console.log(`🚀 Secure Server: https://localhost:${PORT}`));
} else {
    // Fallback to simple HTTP server
    server = http.createServer(app);
    server.listen(PORT, () => console.log(`🚀 HTTP Server: http://localhost:${PORT} (⚠️ SSL files missing)`));
}