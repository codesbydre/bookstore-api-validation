/** Common config for bookstore. */
const MYPASSWORD = require("./secrets");

let DB_URI = `postgresql://andreag:${MYPASSWORD}@localhost`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}

module.exports = { DB_URI };
