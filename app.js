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

//ソート後のデータを処理
app.get('/', (req, res) => {
    const sortMethod = req.query.sort || 'default';

    let sqlQuery = 'SELECT * FROM personas';

    if (sortMethod === 'asc') {
        sqlQuery += ' ORDER BY rating ASC';
    } else if (sortMethod === 'desc') {
        sqlQuery += ' ORDER BY rating DESC';
    }

    con.query(sqlQuery, (err, results) => {
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

        res.render('index', {
            personas: results,
            ageRatingsCount: ageRatingsCount
        });
    });
});

//絞り込み条件の取得
app.get('/', (req, res) => {
        const filterRating = req.query.filter || ''; // クエリストリングから絞り込み条件を取得

        // 絞り込み条件に応じてSQLクエリを生成
        let sqlQuery = 'SELECT * FROM personas';

        if (filterRating !== '') {
            sqlQuery += ` WHERE rating = ${mysql.escape(filterRating)}`;
        }

    con.query(sqlQuery, (err, results) => {
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

        res.render('index', {
            personas: results,
            ageRatingsCount: ageRatingsCount
        });
    });
});

//それぞれの別ファイルへ飛ぶルート
app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/form.ejs'));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/edit.ejs'));
});

//更新処理
app.get('/edit/:id', (req, res) => {
    const reviewId = req.params.id;

    con.query('SELECT * FROM personas WHERE id = ?', [reviewId], (err, result) => {
        if (err) {
            console.error(err);
            res.send('レビューの取得に失敗しました。');
        } else {
            res.render('edit', { review: result[0] });
        }
    });
});

app.post('/update/:id', (req, res) => {
    const reviewId = req.params.id;
    const { username, age, rating, reason } = req.body;

    con.query(
        'UPDATE personas SET username=?, age=?, rating=?, reason=? WHERE id=?',
        [username, age, rating, reason, reviewId],
        (err, result) => {
            if (err) {
                console.error(err);
                res.send('レビューの更新に失敗しました。');
            } else {
                console.log('レビューが更新されました。');
                res.redirect('/');
            }
        }
    );
});

//レビュー追加処理
app.post('/addReview', (req, res) => {
    const { username, age, rating, reason } = req.body;

    con.query('INSERT INTO personas (username, age, rating, reason) VALUES (?, ?, ?, ?)',
        [username, age, rating, reason],
        (err, result) => {
            if (err) {
                console.error(err);
                res.send('レビューの追加に失敗しました。');
            } else {
                console.log('新しいレビューが追加されました。');
                res.redirect('/');
            }
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
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