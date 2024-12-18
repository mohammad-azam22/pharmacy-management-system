const { conn } = require('../config/database_connection');
const path = require("path")
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

const getRegistrationPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'patient_reg.html'));
};

const register = async (req, res) => {

    let fnameCorrect = false;
    let lnameCorrect = false;
    let emailCorrect = false;
    let mobileCorrect = false;
    let dobCorrect = false;
    let genderCorrect = false;
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
        // Generate Patient ID
        let patientNum = generateRandomNum(5);
        const dateObj = new Date();
        const patientYear = dateObj.getFullYear();
        const patientID = pharmacyID + "P" + patientNum + patientYear;
        const fname = titleCase(req.body.fname);
        const lname = titleCase(req.body.lname);

        // Insert data into the DB
        const statement1 = `USE PharmacyDB`;
        const statement2 = `INSERT INTO patients VALUES ('${patientID}', '${fname}', '${lname}', '${req.body.email}', '${req.body.mobile}', '${req.body.dob}', '${req.body.gender[0].toUpperCase()}', '${req.body.address}', 0);`;
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
                        if (err.sqlMessage.includes("patient_id")) {
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

module.exports = {
    getRegistrationPage,
    register
};
