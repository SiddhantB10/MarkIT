const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Subject = require('../src/models/Subject');

describe('Subjects API Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Subject.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear data
    await User.deleteMany({});
    await Subject.deleteMany({});

    // Create and login user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    token = res.body.token;
    userId = res.body.user._id;
  });

  describe('POST /api/subjects', () => {
    it('should create a new subject', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mathematics',
          code: 'MATH101',
          totalLectures: 40,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.subject).toHaveProperty('name', 'Mathematics');
    });

    it('should not create subject without auth', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({
          name: 'Mathematics',
          code: 'MATH101',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/subjects', () => {
    beforeEach(async () => {
      // Create test subjects
      await Subject.create([
        {
          userId,
          name: 'Mathematics',
          code: 'MATH101',
          totalLectures: 40,
        },
        {
          userId,
          name: 'Physics',
          code: 'PHY101',
          totalLectures: 35,
        },
      ]);
    });

    it('should get all subjects for user', async () => {
      const res = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.subjects).toHaveLength(2);
    });

    it('should not get subjects without auth', async () => {
      const res = await request(app).get('/api/subjects');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/subjects/:id', () => {
    let subjectId;

    beforeEach(async () => {
      const subject = await Subject.create({
        userId,
        name: 'Mathematics',
        code: 'MATH101',
        totalLectures: 40,
      });
      subjectId = subject._id;
    });

    it('should get subject by id', async () => {
      const res = await request(app)
        .get(`/api/subjects/${subjectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.subject).toHaveProperty('name', 'Mathematics');
    });

    it('should return 404 for non-existent subject', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/subjects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    let subjectId;

    beforeEach(async () => {
      const subject = await Subject.create({
        userId,
        name: 'Mathematics',
        code: 'MATH101',
        totalLectures: 40,
      });
      subjectId = subject._id;
    });

    it('should update subject', async () => {
      const res = await request(app)
        .put(`/api/subjects/${subjectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Advanced Mathematics',
          totalLectures: 45,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.subject).toHaveProperty('name', 'Advanced Mathematics');
      expect(res.body.subject).toHaveProperty('totalLectures', 45);
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    let subjectId;

    beforeEach(async () => {
      const subject = await Subject.create({
        userId,
        name: 'Mathematics',
        code: 'MATH101',
        totalLectures: 40,
      });
      subjectId = subject._id;
    });

    it('should delete subject', async () => {
      const res = await request(app)
        .delete(`/api/subjects/${subjectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify subject is deleted
      const subject = await Subject.findById(subjectId);
      expect(subject).toBeNull();
    });
  });
});
