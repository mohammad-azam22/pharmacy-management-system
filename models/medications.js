const { conn } = require('../config/database_connection');

conn.query('USE PharmacyDB;', (err) => {
    if (err) {
        console.error(err);
        return;
    }
});

async (req, res) => {
    const statement1 = `
        CREATE TABLE IF NOT EXISTS medication_details (
            med_id VARCHAR(10) PRIMARY KEY,
            med_company VARCHAR(100) NOT NULL,
            med_name VARCHAR(100) NOT NULL,
            med_desc VARCHAR(200) NOT NULL
        );
    `;

    const statement2 = `
        CREATE TABLE IF NOT EXISTS medication_stock (
            med_id VARCHAR(10) NOT NULL,
            batch_id VARCHAR(10) NOT NULL,
            mfg_date DATE NOT NULL,
            exp_date DATE NOT NULL,
            quantity_left SMALLINT NOT NULL,
            cost_price FLOAT(7) NOT NULL,
            selling_price FLOAT(7) NOT NULL,
            status CHAR(1) NOT NULL,
            PRIMARY KEY (med_id, batch_id),
            FOREIGN KEY (med_id) REFERENCES medication_details(med_id)
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