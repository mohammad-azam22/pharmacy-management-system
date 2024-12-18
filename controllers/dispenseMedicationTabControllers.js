const { conn } = require('../config/database_connection');
const pharmacyID = 'MDS1';

// function to generate random number
function generateRandomNum(digits) {
    const multiplier = Math.pow(10, digits);
    let num = Math.floor(Math.random() * multiplier);
    while (Math.floor(Math.log10(num)) + 1 != Math.floor(Math.log10(multiplier))) {
        num = num * 10;
    }
    return num;
}

const updateMedicationStatus = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `UPDATE medication_stock SET status = '0' WHERE quantity_left = 0 OR exp_date < CURRENT_DATE();`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": "Medication Status Updated" });
        });
    });
};

const getBatchNums = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT ms.batch_id batch_num FROM medication_stock ms, medication_details md WHERE md.med_id = ms.med_id AND ms.status = '1' AND UPPER(md.med_name) = '${req.body["med_name"]}' ORDER BY ms.exp_date LIMIT 5;`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};

const getDoctorDetails = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT fname d_fname, lname d_lname FROM doctors WHERE doctor_id = '${req.body["doctor_id"]}';`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};



const executeTransaction = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const user_id = await new Promise((resolve, reject) => {
        const statement2 = `SELECT user_id FROM users WHERE username = '${req.session.user["username"]}';`;
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]["user_id"]);
            }
        });
    });

    const med_ids = [];
    for (let i = 0; i < req.body["med_names"].length; i++) {
        const statement3 = `SELECT ms.med_id med_id FROM medication_stock ms, medication_details md WHERE md.med_name = '${req.body["med_names"][i]}' AND ms.batch_id = '${req.body["batch_nums"][i]}' AND ms.med_id = md.med_id;`;
        const medIdResult = await new Promise((resolve, reject) => {
            conn.query(statement3, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        if (medIdResult.length == 0) {
            res.json({ error: "Invalid Medication Information" });
            return;
        }
        med_ids.push(medIdResult[0]["med_id"]);
    }

    const quantities = [];
    for (let i = 0; i < med_ids.length; i++) {
        const statement4 = `SELECT ms.quantity_left quantity FROM medication_stock ms WHERE ms.med_id = '${med_ids[i]}' AND ms.batch_id = '${req.body["batch_nums"][i]}';`;
        const medQuantityResult = await new Promise((resolve, reject) => {
            conn.query(statement4, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        if (medQuantityResult.length == 0) {
            res.json({ error: "Invalid Medication Information" });
            return;
        }
        quantities.push(medQuantityResult[0]["quantity"]);
    }

    for (let i = 0; i < quantities.length; i++) {
        if (req.body["med_quantities"][i] > quantities[i]) {
            res.json({ error: "Invalid Medicine Quantity: " + req.body["med_quantities"][i] });
            return;
        }
    }

    for (let i = 0; i < req.body["med_names"].length; i++) {
        const newQuantity = parseInt(quantities[i]) - parseInt(req.body["med_quantities"][i]);
        let statement5 = ``;
        if (newQuantity === 0) {
            statement5 = `UPDATE medication_stock SET quantity_left = ${newQuantity}, status = '0' WHERE med_id = '${med_ids[i]}' AND batch_id = '${req.body["batch_nums"][i]}'`;
        }
        else {
            statement5 = `UPDATE medication_stock SET quantity_left = ${newQuantity} WHERE med_id = '${med_ids[i]}' AND batch_id = '${req.body["batch_nums"][i]}'`;
        }
        await new Promise((resolve, reject) => {
            conn.query(statement5, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    const statement6 = `UPDATE patients SET balance = ${req.body["new_balance"]} WHERE patient_id = '${req.body["patient_id"]}'`;
    conn.query(statement6, (err, result) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    // Generate Transaction ID
    let transactionNum = generateRandomNum(6);
    const dateObj = new Date();
    const yearOnly = dateObj.getFullYear()
    const monthOnly = dateObj.getMonth() + 1;
    const dateOnly = dateObj.getDate();
    const date = yearOnly + "-" + monthOnly + "-" + dateOnly;
    const transactionID = pharmacyID + transactionNum;

    // Insert data into the DB
    const statement7 = `INSERT INTO transaction_info VALUES ('${transactionID}', '${user_id}', '${req.body.patient_id}', '${req.body.doctor_id}', '${req.body.sales_amt}', '${date}');`;
    conn.query(statement7, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.sqlMessage.includes("transaction_id")) {
                    res.json({ error: 'Server Error. Please Try Again' });
                }
            }
            else {
                console.log(err)
                res.json({ error: err });
            }
        }
        else {
            conn.commit((err) => {
                if (err) {
                    res.json({ error: err });
                }
            });
        }
    });

    for (let i = 0; i < req.body["med_names"].length; i++) {
        const statement8 = `INSERT INTO transaction_details VALUES ('${transactionID}', '${med_ids[i]}', '${req.body["med_names"][i]}');`;
        await new Promise((resolve, reject) => {
            conn.query(statement8, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    res.json({ message: "transaction successful!" });
};

const getMedicationNames = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT DISTINCT UPPER(md.med_name) AS med_name FROM medication_details md, medication_stock ms WHERE ms.status = 1 AND ms.med_id = md.med_id AND md.med_name LIKE '%${req.body["queryString"]}%' LIMIT 5;`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};

const getPatientDetails = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT fname p_fname, lname p_lname, balance p_balance FROM patients WHERE patient_id = '${req.body["patient_id"]}';`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};

const getQuantity = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT ms.quantity_left quantity FROM medication_stock ms, medication_details md WHERE ms.batch_id = '${req.body["batch_num"]}' AND md.med_name = '${req.body["med_name"]}';`;
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};

const getUnitPrice = (req, res) => {
    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT ms.selling_price unit_price FROM medication_stock ms, medication_details md WHERE md.med_name = '${req.body["med_name"]}' AND ms.batch_id = '${req.body["batch_num"]}';`
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        conn.query(statement2, (err, result) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            res.json({ "results": result });
        });
    });
};

module.exports = {
    updateMedicationStatus,
    getBatchNums,
    getDoctorDetails,
    executeTransaction,
    getMedicationNames,
    getPatientDetails,
    getQuantity,
    getUnitPrice
};
