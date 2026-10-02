import request from 'supertest'
import express from 'express'
import authRouter from '../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

describe('POST /auth/login', () => {
  it('returns a token for valid admin credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr', password: process.env.DEMO_ADMIN_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.email).toBe('admin@docflow.fr')
    expect(res.body.role).toBe('admin')
  })

  it('returns a token for valid user credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@docflow.fr', password: process.env.DEMO_USER_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.role).toBe('user')
  })

  it('returns 401 for unknown credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@docflow.fr', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 401 for a valid email with a wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr', password: 'not-the-password' })

    expect(res.status).toBe(401)
  })

  // Regression guard: the old hardcoded password must never work again
  it('rejects the old hardcoded admin password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr', password: 'admin123' })

    expect(res.status).toBe(401)
  })

  it('returns 400 when a field is missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when the password is not a string', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr', password: { $ne: null } })

    expect(res.status).toBe(400)
  })
})
