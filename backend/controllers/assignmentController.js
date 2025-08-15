// controllers/assignmentController.js
const Assignment = require('../models/Assignment');

// GET all assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.id }); // fetch all assignments, no userId filter
    console.log("These are assignments ",assignments)
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE new assignment
const addAssignment = async (req, res) => {
  const { title, description, courseId, dueAt, status } = req.body;
  try {
    const assignment = await Assignment.create({
      title,
      description: description || '',
      courseId,
      dueAt,
      status: status || 'todo'
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE assignment
const updateAssignment = async (req, res) => {
  const { title, description, courseId, dueAt, status } = req.body;
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.courseId = courseId || assignment.courseId;
    assignment.dueAt = dueAt || assignment.dueAt;
    assignment.status = status || assignment.status;

    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssignments, addAssignment, updateAssignment, deleteAssignment };
