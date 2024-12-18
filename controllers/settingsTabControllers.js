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

// function to convert string to title case
function titleCase(s) {
    return s.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const addUser = (req, res) => {

    let fnameCorrect = false;
    let lnameCorrect = false;
    let mobileCorrect = false;
    let emailCorrect = false;
    let genderCorrect = false;
    let dobCorrect = false;
    let addressCorrect = false;

    // Checking Data
    if (req.body.fname.length <= 20) {
        fnameCorrect = true;
    }
    if (req.body.lname.length <= 20) {
        lnameCorrect = true;
    }
    if (req.body.email.endsWith("@gmail.com") || req.body.email.endsWith("@outlook.com")) {
        emailCorrect = true;
    }
    if (req.body.mobile.length == 10) {
        mobileCorrect = true;
    }
    const diff = Date.now() - new Date(req.body.dob);
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 54750 && Math.floor(diff / (1000 * 60 * 60 * 24)) >= 0) {
        dobCorrect = true;
    }
    if (req.body.gender === "male" || req.body.gender === "female") {
        genderCorrect = true;
    }
    if (req.body.address.length <= 200) {
        addressCorrect = true;
    }

    // Displaying message to the Client
    if (!fnameCorrect) {
        res.json({ error: 'First Name should have less than 20 characters.' });
    }
    else if (!lnameCorrect) {
        res.json({ error: 'Last Name should have less than 20 characters.' });
    }
    else if (!emailCorrect) {
        res.json({ error: 'Only Gmail and Outlook email addresses are allowed.' });
    }
    else if (!mobileCorrect) {
        res.json({ error: 'Invalid Mobile Number' });
    }
    else if (!dobCorrect) {
        res.json({ error: 'Invalid Date of Birth' });
    }
    else if (!genderCorrect) {
        res.json({ error: 'Invalid Gender' });
    }
    else if (!addressCorrect) {
        res.json({ error: 'Address should have less than 200 characters.' });
    }
    else {
        // Generate User ID
        let userNum = generateRandomNum(4);
        const dateObj = new Date();
        const userYear = dateObj.getFullYear();
        const userID = pharmacyID + userNum + userYear;
        const username = (req.body.fname + generateRandomNum(5)).toLowerCase();
        const password = (req.body.fname + "-" + req.body.lname).toLowerCase();
        const yearOnly = dateObj.getFullYear()
        const monthOnly = dateObj.getMonth() + 1;
        const dateOnly = dateObj.getDate();
        const joinDate = yearOnly + "-" + monthOnly + "-" + dateOnly;
        const fname = titleCase(req.body.fname);
        const lname = titleCase(req.body.lname);

        // Insert data into the DB
        const statement1 = `USE PharmacyDB`;
        conn.query(statement1, (err) => {
            if (err) {
                res.json({ error: err });
                return;
            }
        });

        const statement2 = `INSERT INTO users VALUES ('${userID}', '${username}', '${fname}', '${lname}', '${password}', '${req.body.mobile}', '${req.body.email}', '${req.body.gender[0].toUpperCase()}', '${joinDate}', '${req.body.dob}',  '${req.body.address}', 'Inactive');`;
        conn.query(statement1, (err) => {
            if (err) {
                res.json({ error: err });
                return;
            }
            conn.query(statement2, (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        // const errMessage = err.sqlMessage;
                        console.log(err.sqlMessage);
                        if (err.sqlMessage.includes("user_id") || err.sqlMessage.includes("username")) {
                            res.json({ error: 'Server Error. Please Try Again' });
                        }
                        else if (err.sqlMessage.includes("email")) {
                            res.json({ error: 'This email address has already been registered' });
                        }
                        else if (err.sqlMessage.includes("mobile")) {
                            res.json({ error: 'This mobile number has already been registered' });
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
                        else {
                            res.json({ message: 'Registration Successful!' });
                        }
                    });
                }
            });
        });
    }
};


const getAuthorizations = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT user_id, username, fname, lname, role FROM users WHERE username != '${req.session.user["username"]}';`;

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
        result.push(row["user_id"]);
        result.push(row["username"]);
        result.push(row["fname"]);
        result.push(row["lname"]);
        if (row["role"] === 'Admin') {
            row["role"] = "0";
        }
        else if (row["role"] === 'User') {
            row["role"] = "1";
        }
        else {
            row["role"] = "2";
        }
        result.push(row["role"]);
        results.push(result);
    }
    res.json({ "results": results });

};


const getInfo = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT CONCAT(fname, ' ', lname) result FROM users WHERE username = '${req.session.user["username"]}' AND email = '${req.session.user["email"]}';`;
    const statement3 = `SELECT role result from users WHERE username = '${req.session.user["username"]}' AND email = '${req.session.user["email"]}';`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const result1 = req.session.user["username"];

    const result2 = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    const result3 = await new Promise((resolve, reject) => {
        conn.query(statement3, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result[0]["result"]);
            }
        });
    });

    res.json({ "results": [result1, result2, result3] });

};

const updateAuthorizations = async (req, res) => {

    const statement1 = `USE PharmacyDB`;

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    for (let i = 0; i < req.body.length; i++) {
        await new Promise((resolve, reject) => {
            const statement2 = `UPDATE users SET role = '${req.body[i]["role"]}' WHERE user_id = '${req.body[i]["user_id"]}';`;
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

    res.json({ message: "Authorizations Updated" });
};

module.exports = {
    getInfo,
    getAuthorizations,
    updateAuthorizations,
    addUser
};
