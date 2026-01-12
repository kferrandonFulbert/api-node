import request from 'supertest';
import app from '../app.js';

describe('User Controller', () => {
  test('GET /api/v1/users/info returns 200 and msg', async () => {
    const res = await request(app)
      .get('/api/v1/users/info')
      .expect(200);
    
    expect(res.body).toEqual({ msg: 'ok' });
  });
});