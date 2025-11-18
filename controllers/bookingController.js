const { createBooking, deleteBooking, listBookingsByUser, listBookings } = require("../models/bookingModel");

exports.listMyBookings = async (req, res) => {
    const rows = await listBookingsByUser(req.session.user.id);
    res.render("bookings", { title: "My Bookings", bookings: rows, user: req.session.user });
};

exports.bookFlight = async (req, res) => {
	const { flightId } = req.body;
	if (!flightId) return res.status(400).send("Missing flightId");
    await createBooking({ userId: req.session.user.id, flightId });
	return res.redirect("/bookings");
};

exports.cancelBooking = async (req, res) => {
	const { id } = req.params;
    const ok = await deleteBooking(id, req.session.user.id);
	if (!ok) return res.status(404).send("Not found");
	return res.redirect("/bookings");
};


exports.listAllBookings = async (req, res) => {
    const rows = await listBookings();
	res.render("bookings", { title: "All Bookings", bookings: rows, user: req.session.user });
};


