const { conn } = require("./database_connection");

// const statement1 = "CREATE DATABASE PharmacyDB;";
const statement2 = "USE PharmacyDB;";
const statement3 = `
                    CREATE TABLE IF NOT EXISTS users (
                        admin_id VARCHAR(12) NOT NULL PRIMARY KEY,
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
const statement4 = `
                    INSERT INTO users VALUES
                    ('PMS110012024', 'simon100', 'Simon', NULL, 'letmein@101', '9876543210', 'simon2299@gmail.com', 'M', CURDATE(), '1989-09-01', '35-D, Apple Street, London', 'Owner'),
                    ('PMS110022024', 'robert200', 'Robert', 'Jones', 'robert9922', '1234567890', 'robertj4488@gmail.com', 'M', CURDATE(), '1995-03-22', '40-D, Banana Street, London', 'Admin'),
                    ('PMS110032024', 'tony300', 'Tony', 'Stark', 'ironman1911', '5432167890', 'tonystark2288@gmail.com', 'M', CURDATE(), '1996-11-05', '45-D, Carrot Street, London', 'Admin'),
                    ('PMS110042024', 'marie400', 'Marie', 'Gold', 'mariegold2000', '4321789065', 'marie1234@gmail.com', 'F', CURDATE(), '1992-07-15', '45-D, Diamond Street, London', 'Admin');
                    `

const statement5 = `SELECT * FROM users;`

// conn.execute(statement1);
// conn.query(statement2);
// conn.execute(statement3);
// conn.commit();
// conn.execute(statement4);
// conn.commit();

// conn.query(statement5, function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
// });


conn.end();