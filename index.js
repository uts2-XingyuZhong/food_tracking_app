import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "food_tracking_app",
  password: process.env.PGPASSWORD,
  port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// 食材一覧取得
async function getIngredients() {
  const result = await db.query(
    "SELECT name, quantity, added_date FROM added_ingredients"
  );
  return result.rows;
}

app.get("/", async (req, res) => {
  try {
    const addedIngredients = await getIngredients();

    let shownIngredients = [];

    for (const item of addedIngredients) {
      // ingredients_list から一致する食材を取得
      const result = await db.query(
        "SELECT expiration_date, icon FROM ingredients_list WHERE LOWER(name) = LOWER($1)",
        [item.name]
      );

      if (result.rows.length > 0) {
        const { expiration_date, icon } = result.rows[0];

        const today = new Date();
        const addedDate = new Date(item.added_date);

        // 日数差を計算（ミリ秒 → 日）
        const diffTime = today - addedDate;
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const remainingDays = expiration_date - daysPassed;

        shownIngredients.push({
          name: item.name,
          quantity: item.quantity,
          expiration_day: remainingDays,
          icon: icon,
        });
      }
    }

    // 🔥 残り日数が少ない順にソート
    shownIngredients.sort(
      (a, b) => a.expiration_day - b.expiration_day
    );

    const now = new Date();
    const dateInfo = {
      weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
      monthDay: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
      year: now.getFullYear(),
    };

    res.render("index.ejs", {
      dateInfo: dateInfo,
      ingredients: shownIngredients,
    });
  } catch (err) {
    console.error("Error fetching ingredients", err);
    res.status(500).send("Error fetching ingredients from database");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
