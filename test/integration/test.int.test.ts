import { api } from '../setup'

describe('TestController (integration)', () => {
  describe('POST /test/setup', () => {
    it('success', async () => {
      const response = await api.post('/test/setup')
      expect(response.status).toBe(201)
      expect(response.data.roles.length).toBeGreaterThan(0)
      expect(response.data.users.length).toBeGreaterThan(0)
    })

    it('error', async () => {
      const response = await api.get('/test/setup')
      expect(response.status).toBe(401)
    })
  })
})
