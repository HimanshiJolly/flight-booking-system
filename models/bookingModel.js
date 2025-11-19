const { query } = require("../config/db");

async function listBookings() {
    return await query(
        "SELECT id, user_id AS userId, flight_id AS flightId, created_at AS createdAt FROM bookings ORDER BY id DESC"
    );
}

async function listBookingsByUser(userId) {
    return await query(
        "SELECT id, user_id AS userId, flight_id AS flightId, created_at AS createdAt FROM bookings WHERE user_id = :userId ORDER BY id DESC",
        { userId }
    );
}

async function createBooking({ userId, flightId }) {
    const res = await query(
        "INSERT INTO bookings (user_id, flight_id, created_at) VALUES (:userId, :flightId, NOW())",
        { userId, flightId }
    );
    const rows = await query(
        "SELECT id, user_id AS userId, flight_id AS flightId, created_at AS createdAt FROM bookings WHERE id = :id",
        { id: res.insertId }
    );
    return rows[0];
}

async function deleteBooking(id, userId) {
    // ⬇️ FIX START ⬇️
    let sql = "DELETE FROM bookings WHERE id = :id";
    let params = { id };
    
    // Agar userId null nahi hai (normal user), toh user_id constraint lagayenge
    if (userId !== null) {
        sql += " AND user_id = :userId";
        params.userId = userId;
    }
    // Agar userId null hai (Admin), toh sirf ID se delete hoga.
    
    const res = await query(sql, params); // ✅ Corrected query execution
    // ⬇️ FIX END ⬇️
    
    return res.affectedRows > 0;
}

module.exports = { listBookings, listBookingsByUser, createBooking, deleteBooking };