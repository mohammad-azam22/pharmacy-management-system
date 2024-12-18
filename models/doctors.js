const { conn } = require('../config/database_connection');

conn.query('USE PharmacyDB;', (err) => {
    if (err) {
        console.error(err);
        return;
    }
});

async (req, res) => {
    const statement = `
        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id VARCHAR(14) PRIMARY KEY,
            fname VARCHAR(20) NOT NULL,
            lname VARCHAR(20) NOT NULL,
            email VARCHAR(40) NOT NULL UNIQUE,
            mobile VARCHAR(10) NOT NULL UNIQUE,
            dob DATE NOT NULL,
            gender CHAR(1) NOT NULL,
            address VARCHAR(200) NOT NULL
        );
    `;
    conn.query(statement, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}