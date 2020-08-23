const supertest = require('supertest');
const { app } = require('./server');

const request = supertest(app);

describe("GET", () => {
  test("/api/hello", async () => {
    const response = await request.get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body.greeting).toBe("hello API");
  });
});

afterAll(() => app.close());