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

// personasデータを取得
con.query('SELECT * FROM personas', (err, results) => {
    if (err) throw err;

    const ageRatingsCount = {};

    results.forEach(persona => {
        const ageGroup = getAgeGroup(persona.age);
    if (ageRatingsCount[ageGroup]) {
        ageRatingsCount[ageGroup] += 1;
    } else {
        ageRatingsCount[ageGroup] = 1;
    }
});

    app.get('/', (req, res) => {
        res.render('index', {
            personas: results,
            ageRatingsCount: ageRatingsCount
        });
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

function getAgeGroup(age) {
    if (age >= 20 && age < 30) {
        return '20代';
    } else if (age >= 30 && age < 40) {
        return '30代';
    } else if (age >= 40 && age < 50) {
        return '40代';
    } else {
        return 'その他';
    }
}
