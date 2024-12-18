const { conn } = require('../config/database_connection');
const path = require("path")

const getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
};

const login = (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT user_id FROM users WHERE username = '${username}' AND email = '${email}' AND password = '${password}';`;
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
            if (result.length == 1) {
                const statement3 = `SELECT username FROM users WHERE user_id = '${result[0]["user_id"]}' AND role = 'Inactive';`;
                conn.query(statement3, (err, result) => {
                    if (err) {
                        res.json({ error: err });
                        return;
                    }
                    if (result.length == 0) {
                        req.session.user = { username: username, email: email };
                        return res.json({ success: true });

                    }
                    else {
                        return res.status(401).json({ message: 'Unauthorized User' });
                    }
                });
            }
            else {
                return res.status(401).json({ message: 'Invalid Credentials' });
            }
        });
    });
};

const getActivationPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'activate_user.html'));
};

const activate = async (req, res) => {

    const statement1 = `USE PharmacyDB`;
    const statement2 = `SELECT * FROM users WHERE email = '${req.body.email}' AND mobile = '${req.body.mobile}';`;
    const statement3 = `UPDATE users SET username = '${req.body.username}', password = '${req.body.pwd}', role = 'User' WHERE email = '${req.body.email}' AND mobile = '${req.body.mobile}';`;

    if (req.body["pwd"] !== req.body["pwd-confirm"]) {
        res.json({ error: "Passwords does not match!" });
    }

    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    conn.query(statement2, (err, result) => {
        if (err) {
            res.json({ error: err });
            return;
        }
        else if (result.length == 0) {
            res.json({ error: "Credentials Not Registered" });
        }
        else {
            conn.query(statement3, (err, result) => {
                if (err) {
                    res.json({ error: err });
                    return;
                }
                res.json({ message: "Activation Successful" });
            });
        }
    });
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/'); // Redirect to home page
    });
};

module.exports = {
    getLoginPage,
    login,
    getActivationPage,
    activate,
    logout
};
