import request from 'supertest'
import express from 'express'
import authRouter from '../routes/auth'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

describe('POST /auth/login', () => {
  it('retourne un token avec credentials valides', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr', password: 'admin123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.email).toBe('admin@docflow.fr')
    expect(res.body.role).toBe('admin')
  })

  it('retourne 401 avec credentials invalides', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@docflow.fr', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('retourne 400 si champs manquants', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@docflow.fr' })

    expect(res.status).toBe(400)
  })
})