const { conn } = require('../config/database_connection');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

// function to convert string to title case
function titleCase(s) {
    return s.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// function to compare dates
function compareDate(smaller, greater) { 
    let time1 = new Date(smaller).getTime(); 
    let time2 = new Date(greater).getTime(); 
    const differenceMs = time2 - time1;
    const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24)); 
    return differenceDays; 
}

// function to generate Google Gemini output
async function googleGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt]);
    return result.response.text();
}

const addMedication = async (req, res) => {
    req.body["company_name"] = titleCase(req.body["company_name"]);
    req.body["med_name"] = titleCase(req.body["med_name"]);
    req.body["batch_id"] = req.body["batch_id"].toUpperCase();

    if (compareDate(req.body["mfg_date"], req.body["exp_date"]) <= 0) {    // check if mfg_date < exp_date
        res.json({ error: "Invalid Manufacture Date or Expiry Date" });
        return;
    }

    const statement1 = `USE PharmacyDB`;
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const result = await new Promise((resolve, reject) => {
        const statement2 = `SELECT * FROM medication_details WHERE med_company = '${req.body["company_name"]}' AND med_name = '${req.body["med_name"]}'`;
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

    if (result.length == 0) {    // if medication details are not already present in the database
        
        const med_id = pharmacyID + generateRandomNum(6);
        const prompt = `
                Write a very short 100 character 1 paragraph description of 
                the medicine ${req.body["med_name"]} produced by company ${req.body["company_name"]}.
                Follow character limit strictly. write for which ailment it is used. 
                Do not write medicine name and company name in your response. 
                Start with "It is used to ..."
            `;
        let desc = await googleGemini(prompt);
        desc = desc.split(".")[0].replace("'", "''");
        const statement3 = `INSERT INTO medication_details VALUES ('${med_id}', '${req.body["company_name"]}', '${req.body["med_name"]}', '${desc}')`;
        await new Promise((resolve, reject) => {
            conn.query(statement3, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    const med_id = await new Promise((resolve, reject) => {
        const statement4 = `SELECT med_id FROM medication_details WHERE med_company = '${req.body["company_name"]}' AND med_name = '${req.body["med_name"]}'`;
        conn.query(statement4, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]["med_id"]);
            }
        });
    });

    let status;
    if (parseInt(req.body["quantity"]) <= 0 || compareDate(new Date().setHours(0, 0, 0, 0), req.body["exp_date"]) <= 31) {
        status = '0';
    }
    else {
        status = '1';
    }

    const statement5 = `INSERT INTO medication_stock VALUES ('${med_id}', '${req.body["batch_id"]}', '${req.body["mfg_date"]}', '${req.body["exp_date"]}', '${req.body["quantity"]}', '${req.body["price"]}', '${req.body["mrp"]}', '${status}')`;
    await new Promise((resolve, reject) => {
        conn.query(statement5, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
    res.json({ message: "Medication added successfully" });
};

const discardMedications = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    for (let i = 0; i < req.body["med_details"].length; i++) {
        await new Promise((resolve, reject) => {
            const statement2 = `UPDATE medication_stock ms, medication_details md SET ms.status = '2' WHERE md.med_company = '${req.body["med_details"][i][0]}' AND md.med_name = '${req.body["med_details"][i][1]}' AND ms.batch_id = '${req.body["med_details"][i][2]}';`;
            conn.query(statement2, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    res.json({ message: "Medications Removed" });

};


const getExpiredMedications = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT md.med_company, md.med_name, ms.batch_id, ms.mfg_date, ms.exp_date, ms.quantity_left FROM medication_details md, medication_stock ms WHERE ms.med_id = md.med_id AND ms.status = '0' AND ms.quantity_left != '0' ORDER BY ms.exp_date DESC;`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const resultsJSON = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });

    const results = [];
    for (let row of resultsJSON) {
        const result = [];
        result.push(row["med_company"]);
        result.push(row["med_name"]);
        result.push(row["batch_id"]);
        result.push(row["mfg_date"].getDate() + "/" + (row["mfg_date"].getMonth() + 1) + "/" + row["mfg_date"].getFullYear());
        result.push(row["exp_date"].getDate() + "/" + (row["exp_date"].getMonth() + 1) + "/" + row["exp_date"].getFullYear());
        result.push(row["quantity_left"]);
        results.push(result);
    }
    res.json({ "results": results });

};


const getInactiveMedications = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT md.med_company, md.med_name, ms.batch_id, ms.mfg_date, ms.exp_date, ms.quantity_left FROM medication_details md, medication_stock ms WHERE ms.med_id = md.med_id AND ms.status = '0' ORDER BY ms.exp_date DESC;`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const resultsJSON = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });

    const results = [];
    for (let row of resultsJSON) {
        const result = [];
        result.push(row["med_company"]);
        result.push(row["med_name"]);
        result.push(row["batch_id"]);
        result.push(row["mfg_date"].getDate() + "/" + (row["mfg_date"].getMonth()+1) + "/" + row["mfg_date"].getFullYear());
        result.push(row["exp_date"].getDate() + "/" + (row["exp_date"].getMonth()+1) + "/" + row["exp_date"].getFullYear());
        result.push(row["quantity_left"]);
        results.push(result);
    }
    res.json({ "results": results });

};

const getInStockMedications = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT md.med_company, md.med_name, ms.batch_id, ms.mfg_date, ms.exp_date, ms.quantity_left FROM medication_details md, medication_stock ms WHERE ms.med_id = md.med_id AND ms.status = '1';`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const resultsJSON = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });

    const results = [];
    for (let row of resultsJSON) {
        const result = [];
        result.push(row["med_company"]);
        result.push(row["med_name"]);
        result.push(row["batch_id"]);
        result.push(row["mfg_date"].getDate() + "/" + (row["mfg_date"].getMonth()+1) + "/" + row["mfg_date"].getFullYear());
        result.push(row["exp_date"].getDate() + "/" + (row["exp_date"].getMonth()+1) + "/" + row["exp_date"].getFullYear());
        result.push(row["quantity_left"]);
        results.push(result);
    }
    res.json({ "results": results });

};

module.exports = {
    addMedication,
    discardMedications,
    getExpiredMedications,
    getInactiveMedications,
    getInStockMedications
};
