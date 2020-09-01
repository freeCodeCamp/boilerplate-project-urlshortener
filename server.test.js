const supertest = require('supertest');
// MONGO_URL is provided by @shelf/jest-mongodb
process.env.DB_URI = process.env.MONGO_URL;
const { appServer, mongoose } = require('./server');
const request = supertest(appServer);

afterAll(async () => {
    await mongoose.disconnect();
    await appServer.close()
});

describe("GET", () => {
  test("/api/hello", async () => {
    const response = await request.get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body.greeting).toBe("hello API");
  });
});