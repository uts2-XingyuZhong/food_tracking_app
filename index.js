import dotenv from 'dotenv'
dotenv.config()

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// PostgreSQL 接続設定（環境変数を優先）
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'food_tracking_app',
  password: process.env.PGPASSWORD,
  port:  5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// 食材一覧ページ
app.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT name, quantity, added_date FROM added_ingredients ORDER BY added_date ASC'
    );

    const ingredients = result.rows.map((row) => ({
      name: row.name,
      quantity: row.quantity,
      added_date: row.added_date,
    }));

    const now = new Date();
    const dateInfo = {
      weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
      monthDay: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      year: now.getFullYear(),
    };

    res.render('index.ejs', {
      dateInfo,
      ingredients,
    });
  } catch (err) {
    console.error('Error fetching ingredients', err);
    res.status(500).send('Error fetching ingredients from database');
  }
});



app.listen(port,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/*
日付計算
const date = new Date('2026-03-13');

date.setDate(date.getDate() + 14);

console.log(date);
 */