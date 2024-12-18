const { conn } = require('../config/database_connection');

conn.query('USE PharmacyDB;', (err) => {
    if (err) {
        console.error(err);
        return;
    }
});

async (req, res) => {
    const statement1 = `
        CREATE TABLE IF NOT EXISTS transaction_info (
            transaction_id VARCHAR(10) PRIMARY KEY,
            user_id VARCHAR(12) NOT NULL,
            patient_id VARCHAR(14) NOT NULL,
            doctor_id VARCHAR(14) NOT NULL,
            sales_amt MEDIUMINT NOT NULL,
            date DATE NOT NULL
        );
    `;

    const statement2 = `
        CREATE TABLE transaction_details (
            transaction_id VARCHAR(10),
            med_id VARCHAR(10) NOT NULL,
            med_name VARCHAR(100) NOT NULL,
            PRIMARY KEY (transaction_id, med_id),
            FOREIGN KEY (med_id) REFERENCES medication_details(med_id),
            FOREIGN KEY (transaction_id) REFERENCES transaction_info(transaction_id)
        );
    `;
    conn.query(statement1, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        else {
            conn.query(statement2, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }
    });
}