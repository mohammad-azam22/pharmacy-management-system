const { conn } = require('../config/database_connection');

conn.query('USE PharmacyDB;', (err) => {
    if (err) {
        console.error(err);
        return;
    }
});

async (req, res) => {
    const statement = `
        CREATE TABLE IF NOT EXISTS users (
            user_id VARCHAR(12) NOT NULL PRIMARY KEY,
            username VARCHAR(20) NOT NULL UNIQUE,
            fname VARCHAR(20) NOT NULL,
            lname VARCHAR(20),
            password VARCHAR(20) NOT NULL,
            mobile VARCHAR(10) NOT NULL UNIQUE,
            email VARCHAR(30) NOT NULL UNIQUE,
            gender CHAR(1) NOT NULL,
            join_date DATE NOT NULL,
            dob DATE NOT NULL,
            address VARCHAR(200) NOT NULL,
            role VARCHAR(10) NOT NULL
        );
    `;
    conn.query(statement, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}