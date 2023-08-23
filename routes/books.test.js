const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

process.env.NODE_ENV = "test";

let testBook;

beforeEach(async () => {
  const result = await Book.create({
    isbn: "1234567890",
    amazon_url: "http://a.co/1234",
    author: "Test Author",
    language: "english",
    pages: 100,
    publisher: "Test Publisher",
    title: "Test Title",
    year: 2020,
  });
  console.log("Result from Book.create:", result);
  testBook = result; //Book.create = book object, no need for .rows[0]
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", () => {
  it("Gets a list of books", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.books[0]).toHaveProperty("isbn");
  });
});

describe("GET /books/:id", () => {
  it("Gets a single book", async () => {
    const res = await request(app).get(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty("isbn", testBook.isbn);
  });

  it("Responds with 404 for invalid ISBN", async () => {
    const res = await request(app).get("/books/invalidisbn");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /books", () => {
  it("Creates a new book", async () => {
    const res = await request(app).post("/books").send({
      isbn: "0987654321",
      amazon_url: "http://a.co/differentURL",
      author: "Another Test Author",
      language: "english",
      pages: 150,
      publisher: "Another Test Publisher",
      title: "Another Test Title",
      year: 2022,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.book).toHaveProperty("isbn");
  });

  it("Prevents creating book with invalid data", async () => {
    const res = await request(app)
      .post("/books")
      .send({ isbn: "invalidbookdata" });
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", () => {
  it("Updates a book", async () => {
    const res = await request(app).put(`/books/${testBook.isbn}`).send({
      isbn: "1234567890",
      amazon_url: "http://a.co/newURL",
      author: "Updated Test Author",
      language: "english",
      pages: 200,
      publisher: "Updated Test Publisher",
      title: "Updated Test Title",
      year: 2023,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.book).toHaveProperty("title", "Updated Test Title");
  });

  it("Prevents updating a book with invalid data", async () => {
    const res = await request(app)
      .put(`/books/${testBook.isbn}`)
      .send({ title: "" });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", () => {
  it("Deletes a book", async () => {
    const res = await request(app).delete(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});
