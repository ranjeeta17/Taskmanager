// controllers/assignmentController.js
const Assignment = require("../models/Assignment");

// GET all assignments
const getAssignments = async (req, res) => {
  try {
    const { status, courseId, due } = req.query;
    let query = { userId: req.user.id };

    // Apply filters
    if (status) query.status = status;
    if (courseId) query.courseId = { $regex: courseId, $options: "i" };
    if (due) {
      const now = new Date();
      if (due === "today") {
        const start = new Date(now.setHours(0, 0, 0, 0));
        const end = new Date(now.setHours(23, 59, 59, 999));
        query.dueAt = { $gte: start, $lte: end };
      } else if (due === "tomorrow") {
        const start = new Date(now);
        start.setDate(start.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        query.dueAt = { $gte: start, $lte: end };
      } else if (due === "week") {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        query.dueAt = { $gte: now, $lte: endOfWeek };
      } else if (due === "overdue") {
        query.dueAt = { $lt: now };
      }
    }

    const assignments = await Assignment.find(query).sort({ dueAt: 1 });
    console.log(
      `Fetched ${assignments.length} assignments for user ${req.user.id}`
    );
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: error.message });
  }
};

// CREATE new assignment
const addAssignment = async (req, res) => {
  const { title, description, courseId, dueAt, status } = req.body;
  try {
    const assignment = await Assignment.create({
      title,
      description: description || "",
      courseId,
      dueAt,
      status: status || "todo",
      userId: req.user.id, // Add userId from authenticated user
    });
    console.log(`Created assignment ${assignment._id} for user ${req.user.id}`);
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE assignment
const updateAssignment = async (req, res) => {
  const { title, description, courseId, dueAt, status } = req.body;
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    if (assignment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this assignment" });
    }

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.courseId = courseId || assignment.courseId;
    assignment.dueAt = dueAt || assignment.dueAt;
    assignment.status = status || assignment.status;

    const updatedAssignment = await assignment.save();
    console.log(`Updated assignment ${req.params.id} for user ${req.user.id}`);
    res.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    if (assignment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this assignment" });
    }

    await assignment.deleteOne();
    console.log(`Deleted assignment ${req.params.id} for user ${req.user.id}`);
    res.json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
};
