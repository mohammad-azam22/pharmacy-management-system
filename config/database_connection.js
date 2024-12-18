require('dotenv').config({ path: "./.env" });

const mysql = require('mysql2');

const config = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE,
	// ssl: {
	// rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED,
	// ca: fs.readFileSync(path.join("./",process.env.DB_SSL_PATH)),
	// }
};


const connection = mysql.createConnection(config);
console.log(connection.sequenceId);

module.exports = {
	"conn": connection,
};