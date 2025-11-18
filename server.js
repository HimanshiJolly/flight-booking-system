const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
	cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Simple logger middleware
app.use((req, res, next) => { console.log(req.method, req.url); next(); });

// Routes
const authRoutes = require("./routes/authRoutes");
const flightRoutes = require("./routes/flightRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
app.use((req, res, next) => { res.locals.user = req.session?.user; next(); });
app.use("/", authRoutes);
app.use("/", flightRoutes);
app.use("/", bookingRoutes);

const { requireAuth } = require("./middleware/authMiddleware");
const { listFlights } = require("./models/flightModel");
app.get("/", requireAuth, async (req, res) => {
	const flights = (await listFlights()).slice(0, 6);
	res.render("index", { title: "Home", flights });
});

// 404
app.use((req, res) => { res.status(404).send("Not Found"); });

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
