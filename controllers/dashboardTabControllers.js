const { conn } = require('../config/database_connection');


const getInfo = async (req, res) => {

    const dateObj = new Date();
    const yearOnly = dateObj.getFullYear()
    const monthOnly = dateObj.getMonth() + 1;
    const dateOnly = dateObj.getDate();
    const date = yearOnly + "-" + monthOnly + "-" + dateOnly;

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT COALESCE(COUNT(*), 0) result FROM patients;`;
    const statement3 = `SELECT COALESCE(COUNT(patient_id), 0) result FROM transaction_info WHERE date = '${date}';`;
    const statement4 = `SELECT COALESCE(SUM(sales_amt), 0) result FROM transaction_info WHERE date = '${date}';`;
    const statement5 = `SELECT COALESCE(COUNT(DISTINCT md.med_name), 0) result FROM medication_stock ms, medication_details md WHERE ms.med_id = md.med_id AND ms.status = '1';`;
    const statement6 = `SELECT COALESCE(COUNT(DISTINCT md.med_name), 0) result FROM medication_stock ms, medication_details md WHERE ms.med_id = md.med_id AND ms.quantity_left = 0;`;
    const statement7 = `SELECT COALESCE(COUNT(DISTINCT md.med_name), 0) result FROM medication_stock ms, medication_details md WHERE ms.med_id = md.med_id AND ms.quantity_left != 0 AND ms.status = '0';`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const result1 = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result2 = await new Promise((resolve, reject) => {
        conn.query(statement3, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result3 = await new Promise((resolve, reject) => {
        conn.query(statement4, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result4 = await new Promise((resolve, reject) => {
        conn.query(statement5, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result5 = await new Promise((resolve, reject) => {
        conn.query(statement6, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result6 = await new Promise((resolve, reject) => {
        conn.query(statement7, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    res.json({ "results": [result1, result2, result3, result4, result5, result6] });

};

module.exports = {
    getInfo
};