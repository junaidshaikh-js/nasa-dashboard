import request from 'supertest'
import app from '../../app.js'

describe('Test GET /planets', () => {
  test('it should respond with 200 success', async () => {
    const reponse = request(app)
      .get('/v1/planets')
      .expect('Content-Type', /json/)
      .expect(200)
  })
})