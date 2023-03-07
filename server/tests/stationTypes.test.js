import request from "supertest";
import app from "../index";
import pool from "../config/database";

describe("StationTypes API testing", () => {
  let stationTypeId;

  // Test the POST /stationTypes route
  describe("POST /stationTypes", () => {
    it("should create a new station type", async () => {
      const res = await request(app).post("/stationTypes").send({
        name: "Type Test",
        maxpower: 20,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.name).toEqual("Test Station Type");
      expect(res.body.data.maxpower).toEqual(100);

      // Store the ID of the created station type for later tests
      stationTypeId = res.body.data.id;
    });

    it("should return an error if name or maxpower is missing", async () => {
      const res = await request(app).post("/stationTypes").send({});

      expect(res.statusCode).toEqual(500);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toEqual(
        "Server Error while trying to create StationType"
      );
    });
  });

  // Test the GET /stationTypes route
  describe("GET /stationTypes", () => {
    it("should return a list of station types", async () => {
      const res = await request(app).get("/stationTypes");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // // Test the GET /stationTypes/:id route
  describe("GET /stationTypes/:id", () => {
    it("should return a single station type", async () => {
      const res = await request(app).get(`/stationTypes/${stationTypeId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.id).toEqual(stationTypeId);
    });

    it("should return an error if station type is not found", async () => {
      const res = await request(app).get("/stationTypes/2");

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toEqual(false);
    });
  });

  // // Test the PUT /stationTypes/:id route
  describe("PUT /stationTypes/:id", () => {
    it("should update a single station type", async () => {
      const res = await request(app)
        .put(`/stationTypes/${stationTypeId}`)
        .send({ name: "Updated Station Type" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.message).toEqual("Update successful");
    });

    it("should return an error if station type is not found", async () => {
      const res = await request(app)
        .put("/stationTypes/2")
        .send({ name: "Updated Station Type" });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toEqual(false);
    });

    it("should return an error if name or maxpower is missing", async () => {
      const res = await request(app)
        .put(`/stationTypes/${stationTypeId}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
      expect(res.body.message).toEqual("Name or maxpower is required");
    });
  });

  // // Test the DELETE /stationTypes/:id route
  describe("DELETE /stationTypes/:id", () => {
    it("should delete a single station type", async () => {
      const res = await request(app).delete(`/stationTypes/${stationTypeId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    it("should return an error if station type is not found", async () => {
      const res = await request(app).delete("/stationTypes/2");

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toEqual(false);
    });
  });
});

// Close the database connection after all tests are done
afterAll(async () => {
  await pool.end();
});
