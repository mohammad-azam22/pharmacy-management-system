const { conn } = require('../config/database_connection');

const getChartData = async (req, res) => {
   
    const statement1 = `USE PharmacyDB`;
    conn.query(statement1, (err) => {
        if (err) {
            res.json({ error: err });
            return;
        }
    });

    const data = [];

    let agg_metric;

    if (req.body["aggregate"] === 'sum') {
        agg_metric = 'SUM(sales_amt)';
    }
    else if (req.body["aggregate"] === 'avg') {
        agg_metric = 'AVG(sales_amt)';
    }

    let statement2;
    if (req.body["granularity"] == 'yearly') {
        statement2 = `SELECT YEAR(date) AS label, ${agg_metric} value FROM transaction_info GROUP BY label ORDER BY label;`;
    }
    else if (req.body["granularity"] == 'monthly') {
        statement2 = `SELECT DATE_FORMAT(date, '%Y-%m') AS label, ${agg_metric} value FROM transaction_info GROUP BY label ORDER BY label;`;
    }
    else {
        statement2 = `SELECT date AS label, ${agg_metric} value FROM transaction_info GROUP BY label ORDER BY label;`;
    }

    const results = await new Promise((resolve, reject) => {
        conn.query(statement2, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });

    res.json({ "results": results });

};

module.exports = {
    getChartData
};
