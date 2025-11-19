const mongoose = require('mongoose');

// MongoDB connection string (Aap ise .env mein bhi set kar sakte hain)
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flight_audit_logs';

const connectMongo = () => {
    mongoose.connect(mongoUri)
        .then(() => console.log("✅ MongoDB Connected (for Audit Logs)."))
        .catch(err => console.log("⚠️ MongoDB Error: Logs won't save.", err.message));
};

// Define Audit Log Schema
const LogSchema = new mongoose.Schema({
    action: String, // e.g., 'POST request to /login'
    user: String,   // e.g., user email or 'Guest'
    timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('AuditLog', LogSchema);

module.exports = { connectMongo, AuditLog };