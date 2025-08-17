// backend/test/example_test.js
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// ---- MODELS ----
const Task = require('../models/Task');
const Event = require('../models/Event');
const Assignment = require('../models/Assignment');

// ---- CONTROLLERS ----
const {
  updateTask,
  getTasks,
  addTask,
  deleteTask,
} = require('../controllers/taskController');

const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/EventController');

const {
  getAssignments,
  // Your controller exports addAssignment; alias it to createAssignment for tests
  addAssignment: createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');

/* --------------------------------------------------------------------------------
   TASK CONTROLLER TESTS (your originals)
-------------------------------------------------------------------------------- */
describe('Task Controller', () => {
  afterEach(() => sinon.restore());

  describe('AddTask Function Test', () => {
    it('should create a new task successfully', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' },
      };

      const createdTask = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };
      const createStub = sinon.stub(Task, 'create').resolves(createdTask);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await addTask(req, res);

      expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdTask)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      const createStub = sinon.stub(Task, 'create').throws(new Error('DB Error'));

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' },
      };

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await addTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('Update Function Test', () => {
    it('should update task successfully', async () => {
      const taskId = new mongoose.Types.ObjectId();
      const existingTask = {
        _id: taskId,
        title: 'Old Task',
        description: 'Old Description',
        completed: false,
        deadline: new Date(),
        save: sinon.stub().resolvesThis(),
      };
      const findByIdStub = sinon.stub(Task, 'findById').resolves(existingTask);

      const req = { params: { id: taskId }, body: { title: 'New Task', completed: true } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await updateTask(req, res);

      expect(existingTask.title).to.equal('New Task');
      expect(existingTask.completed).to.equal(true);
      expect(res.status.called).to.be.false;
      expect(res.json.calledOnce).to.be.true;

      findByIdStub.restore();
    });

    it('should return 404 if task is not found', async () => {
      const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateTask(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 500 on error', async () => {
      const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;

      findByIdStub.restore();
    });
  });

  describe('GetTask Function Test', () => {
    it('should return tasks for the given user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const tasks = [
        { _id: new mongoose.Types.ObjectId(), title: 'Task 1', userId },
        { _id: new mongoose.Types.ObjectId(), title: 'Task 2', userId },
      ];

      const findStub = sinon.stub(Task, 'find').resolves(tasks);

      const req = { user: { id: userId } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await getTasks(req, res);

      expect(findStub.calledOnceWith({ userId })).to.be.true;
      expect(res.json.calledWith(tasks)).to.be.true;
      expect(res.status.called).to.be.false;

      findStub.restore();
    });

    it('should return 500 on error', async () => {
      const findStub = sinon.stub(Task, 'find').throws(new Error('DB Error'));

      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await getTasks(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      findStub.restore();
    });
  });

  describe('DeleteTask Function Test', () => {
    it('should delete a task successfully', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const task = { remove: sinon.stub().resolves() };
      const findByIdStub = sinon.stub(Task, 'findById').resolves(task);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await deleteTask(req, res);

      expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
      expect(task.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 404 if task is not found', async () => {
      const findByIdStub = sinon.stub(Task, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteTask(req, res);

      expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 500 if an error occurs', async () => {
      const findByIdStub = sinon.stub(Task, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteTask(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      findByIdStub.restore();
    });
  });
});

/* --------------------------------------------------------------------------------
   EVENT CONTROLLER TESTS
   (uses req.user._id and doc.userId for ownership checks)
-------------------------------------------------------------------------------- */
describe('Event Controller', () => {
  afterEach(() => sinon.restore());

  it('createEvent → creates event (201)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const body = {
      title: 'Exam 1',
      type: 'exam',
      startAt: '2025-09-01T10:00:00Z',
      endAt: '2025-09-01T12:00:00Z',
      courseId: 'COMP101',
      notes: 'Bring ID',
      location: 'Hall A',
      priority: 'high',
      isRecurring: false,
      recurrencePattern: { frequency: 'none', interval: 1 },
    };
    const created = { _id: new mongoose.Types.ObjectId(), ...body, userId };

    const req = { user: { _id: userId }, body };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Event, 'create').resolves(created);

    await createEvent(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('getEvents → returns list for user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = { user: { _id: userId }, query: { type: 'lecture', courseId: 'COMP' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    const rows = [{ _id: new mongoose.Types.ObjectId(), title: 'Lecture', userId }];
    const sortStub = sinon.stub().resolves(rows);
    sinon.stub(Event, 'find').returns({ sort: sortStub });

    await getEvents(req, res);

    expect(sortStub.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(rows)).to.be.true;
  });

  it('updateEvent → updates fields', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      userId,                 // ownership check needs this
      title: 'Old',
      save: sinon.stub().resolvesThis(),
    };
    const req = {
      user: { _id: userId },  // controller compares to this
      params: { id: doc._id.toString() },
      body: { title: 'New' },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    sinon.stub(Event, 'findById').resolves(doc);

    await updateEvent(req, res);

    expect(doc.title).to.equal('New');
    expect(doc.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;
  });

  it('deleteEvent → deletes when found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = {
      userId,                                  // ownership check needs this
      deleteOne: sinon.stub().resolves(),      // support deleteOne impl
      remove: sinon.stub().resolves(),         // or remove impl
    };
    const req = {
      user: { _id: userId },
      params: { id: new mongoose.Types.ObjectId().toString() },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    sinon.stub(Event, 'findById').resolves(doc);

    await deleteEvent(req, res);

    const calledDelete = doc.deleteOne.calledOnce || doc.remove.calledOnce;
    expect(calledDelete).to.be.true;
    expect(res.json.calledWith({ message: 'Event deleted' })).to.be.true;
  });

  it('deleteEvent → 404 when missing', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Event, 'findById').resolves(null);

    await deleteEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Event not found' })).to.be.true;
  });
});

/* --------------------------------------------------------------------------------
   ASSIGNMENT CONTROLLER TESTS
   (controller uses req.user.id (string), checks assignment.userId.toString())
-------------------------------------------------------------------------------- */
describe('Assignment Controller', () => {
  afterEach(() => sinon.restore());

  it('createAssignment → creates assignment (201)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const body = {
      title: 'Project 1',
      description: 'Build something',
      courseId: 'IFN580',
      dueAt: '2025-09-15T00:00:00Z',
      status: 'todo',
      priority: 'medium',
    };
    const created = { _id: new mongoose.Types.ObjectId(), ...body, userId: userId.toString() };

    const req = { user: { id: userId.toString() }, body }; // controller uses id as string
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Assignment, 'create').resolves(created);

    await createAssignment(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(created)).to.be.true;
  });

  it('getAssignments → returns list for user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = { user: { id: userId.toString() }, query: { status: 'todo', courseId: 'IFN' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    const rows = [{ _id: new mongoose.Types.ObjectId(), title: 'Lab', userId: userId.toString() }];
    const sortStub = sinon.stub().resolves(rows);
    sinon.stub(Assignment, 'find').returns({ sort: sortStub });

    await getAssignments(req, res);

    expect(sortStub.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledWith(rows)).to.be.true;
  });

  it('updateAssignment → updates fields', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,                           // ObjectId in doc
      title: 'Old',
      status: 'todo',
      save: sinon.stub().resolvesThis(),
    };
    const req = {
      user: { id: userId.toString() },          // controller compares to string
      params: { id: doc._id.toString() },
      body: { status: 'in-progress', title: 'New' },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    sinon.stub(Assignment, 'findById').resolves(doc);

    await updateAssignment(req, res);

    expect(doc.title).to.equal('New');
    expect(doc.status).to.equal('in-progress');
    expect(doc.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;
  });

  it('deleteAssignment → deletes when found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = {
      userId: userId,                            // ObjectId in doc
      deleteOne: sinon.stub().resolves(),        // controller uses deleteOne()
      remove: sinon.stub().resolves(),           // fallback
    };
    const req = {
      user: { id: userId.toString() },           // string on req.user.id
      params: { id: new mongoose.Types.ObjectId().toString() },
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    sinon.stub(Assignment, 'findById').resolves(doc);

    await deleteAssignment(req, res);

    const calledDelete = doc.deleteOne.calledOnce || doc.remove.calledOnce;
    expect(calledDelete).to.be.true;
    expect(res.json.calledWith({ message: 'Assignment deleted' })).to.be.true;
  });

  it('deleteAssignment → 404 when missing', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    sinon.stub(Assignment, 'findById').resolves(null);

    await deleteAssignment(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Assignment not found' })).to.be.true;
  });
});
