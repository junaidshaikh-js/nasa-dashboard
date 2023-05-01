import request from 'supertest'

import app from '../../app.js'
import { mongoConnect, mongoDisconnect } from '../../services/mongo.js'
import { loadPlanetsData } from '../../models/planets.model.js'

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect()
  })

  afterAll(async () => {
    await mongoDisconnect()
    await loadPlanetsData()
  })

  describe('Test GET /launches', () => {
    test('It should repond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200)
      // expect(response.statusCode).toBe(200)
    })
  })

  describe('Test POST /launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      launchDate: 'January 20, 2024',
      rocket: 'NCC 1710-D',
      target: 'Kepler-62 f'
    }

    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1710-D',
      target: 'Kepler-62 f'
    }

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      launchDate: 'foo',
      rocket: 'NCC 1710-D',
      target: 'Kepler-62 f'
    }

    test('It should response with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201)

      const requestDate = new Date(completeLaunchData.launchDate).valueOf()
      const responseDate = new Date(response.body.launch.launchDate).valueOf()

      expect(responseDate).toBe(requestDate)
      expect(response.body.launch).toMatchObject(launchDataWithoutDate)
    })

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Missing required launch properties'
      })
    })

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date'
      })
    })
  })
})
