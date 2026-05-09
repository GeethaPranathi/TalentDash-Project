const request = require('supertest');

// Mock ml-regression before requiring app
jest.mock('ml-regression', () => ({
  MultivariateLinearRegression: jest.fn().mockImplementation(() => ({
    predict: jest.fn().mockReturnValue([600000])
  }))
}));

const app = require('../server');

describe('Backend API Tests', () => {
  
  test('GET /salaries should return an array', async () => {
    const res = await request(app).get('/salaries');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /predict-salary should work with fallback', async () => {
    const res = await request(app)
      .post('/predict-salary')
      .send({ experience: 5, level: 'Junior', company: 'Test', role: 'Dev' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('predictedSalary');
  });

  test('GET /jobs should return an array', async () => {
    const res = await request(app).get('/jobs');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/missing');
    expect(res.statusCode).toEqual(404);
  });

});
