const mysql = require("mysql2/promise");

let pool;

function getPool() {
	if (pool) return pool;
	pool = mysql.createPool({
		host: process.env.MYSQL_HOST || "127.0.0.1",
		port: Number(process.env.MYSQL_PORT || 3306),
		user: process.env.MYSQL_USER || "root",
		password: process.env.MYSQL_PASSWORD || "Komal@12345",
		database: process.env.MYSQL_DATABASE || "flight_booking",
		connectionLimit: 10,
		namedPlaceholders: true
	});
	return pool;
}

async function query(sql, params = {}) {
	const conn = await getPool().getConnection();
	try {
		const [rows] = await conn.execute(sql, params);
		return rows;
	} finally {
		conn.release();
	}
}

module.exports = { getPool, query };


