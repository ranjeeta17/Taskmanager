const mongoose = require("mongoose");
const chai = require("chai");
const expect = chai.expect;

// Import the Event model
const Event = require("../models/Event");

// Connect to a test database before running tests
before(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/taskmanager_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Event.deleteMany(); // clear old test data
});

// Disconnect after all tests
after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Event Model", () => {
  it("should save a valid event", async () => {
    const event = new Event({
      title: "Test Lecture",
      type: "lecture",
      startAt: new Date("2025-08-20T10:00:00Z"),
      endAt: new Date("2025-08-20T12:00:00Z"),
      courseId: "COMP101",
      notes: "Bring slides",
      location: "Room 12",
      priority: "high",
      userId: new mongoose.Types.ObjectId(),
    });

    const savedEvent = await event.save();
    expect(savedEvent._id).to.exist;
    expect(savedEvent.title).to.equal("Test Lecture");
  });

  it("should fail if end date is before start date", async () => {
    const badEvent = new Event({
      title: "Invalid Event",
      type: "exam",
      startAt: new Date("2025-08-21T15:00:00Z"),
      endAt: new Date("2025-08-21T13:00:00Z"), // invalid
      courseId: "COMP102",
      userId: new mongoose.Types.ObjectId(),
    });

    try {
      await badEvent.save();
      throw new Error("Event should not save with invalid dates");
    } catch (err) {
      expect(err).to.exist;
      expect(err.errors["endAt"].message).to.equal(
        "End date must be after start date"
      );
    }
  });
});
