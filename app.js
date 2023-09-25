const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');


const mysql = require('mysql2');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'express_db'
});

// cssファイルの取得
app.use(express.static('assets'));

// mysqlからデータを持ってくる
con.query('SELECT * FROM personas', (err, results) => {
    if (err) throw err;

    // Express.jsを使用してWebページを作成
    app.get('/', (req, res) => {
        res.render('index', { personas: results });
        const ageStatistics = calculateAgeStatistics(results);
    displayAgeStatistics(ageStatistics);
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
