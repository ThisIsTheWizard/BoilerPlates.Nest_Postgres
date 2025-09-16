import { api } from './setup'

describe('Database Seeding (e2e)', () => {
  describe('Role Seeding', () => {
    it('should seed all system roles', async () => {
      const response = await api.post('/roles/seed')
      expect(response.status).toBe(201)

      const rolesResponse = await api.get('/roles')
      expect(rolesResponse.data.length).toBeGreaterThanOrEqual(4)
    })

    it('should not create duplicate roles', async () => {
      await api.post('/roles/seed')
      const firstCount = (await api.get('/roles')).data.length
      
      await api.post('/roles/seed')
      const secondCount = (await api.get('/roles')).data.length
      
      expect(firstCount).toBe(secondCount)
    })
  })

  describe('Permission Seeding', () => {
    it('should seed all system permissions', async () => {
      const response = await api.post('/permissions/seed')
      expect(response.status).toBe(201)

      const permissionsResponse = await api.get('/permissions')
      expect(permissionsResponse.data.length).toBe(20)
    })

    it('should not create duplicate permissions', async () => {
      await api.post('/permissions/seed')
      const firstCount = (await api.get('/permissions')).data.length
      
      await api.post('/permissions/seed')
      const secondCount = (await api.get('/permissions')).data.length
      
      expect(firstCount).toBe(secondCount)
    })
  })

  describe('Complete System Seeding', () => {
    it('should seed roles and permissions together', async () => {
      await Promise.all([
        api.post('/roles/seed'),
        api.post('/permissions/seed')
      ])

      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ])

      expect(rolesResponse.data.length).toBeGreaterThanOrEqual(4)
      expect(permissionsResponse.data.length).toBe(20)
    })
  })
})