const { createBooking, deleteBooking, listBookingsByUser, listBookings } = require("../models/bookingModel");

exports.listMyBookings = async (req, res) => {
    const rows = await listBookingsByUser(req.session.user.id);
    res.render("bookings", { title: "My Bookings", bookings: rows, user: req.session.user });
};

exports.bookFlight = async (req, res) => {
    const { flightId } = req.body;
	if (!flightId) return res.status(400).send("Missing flightId");
    await createBooking({ userId: req.session.user.id, flightId });
    
    // Socket.IO notification (optional, but keep it for real-time feature)
    if (req.io) {
        req.io.to('admins').emit('notification', { message: `New booking created by ${req.session.user.email}` });
    }
    
	return res.redirect("/bookings");
};

exports.cancelBooking = async (req, res) => {
	const { id } = req.params;
    
    // ⬇️ FIX START ⬇️
    // 1. Check if the user is an Admin
    const isCurrentUserAdmin = req.session.user.role === 'admin';
    
    // 2. Agar Admin hai, toh NULL bhejo (taki model user check skip kar de).
    //    Agar normal user hai, toh apni user ID bhejo (taki woh sirf apni booking delete kar sake).
    const userIdConstraint = isCurrentUserAdmin ? null : req.session.user.id;
    
    const ok = await deleteBooking(id, userIdConstraint); // ✅ Corrected logic
    // ⬇️ FIX END ⬇️
    
	if (!ok) return res.status(404).send("Not found");
	
    // Socket.IO notification (optional)
    if (req.io) {
        req.io.to('admins').emit('notification', { message: `Booking ${id} cancelled by ${req.session.user.role}` });
    }
    
	return res.redirect("/bookings");
};


exports.listAllBookings = async (req, res) => {
    const rows = await listBookings();
	res.render("bookings", { title: "All Bookings", bookings: rows, user: req.session.user });
};