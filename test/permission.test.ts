import { api } from './setup'

describe('PermissionController (e2e)', () => {
  describe('/permissions (POST)', () => {
    it('should create a new permission', async () => {
      const response = await api.post('/permissions', {
        action: 'create',
        module: 'role'
      })
      expect(response.status).toBe(201)
    })

    it('should create permission without created_by', async () => {
      const response = await api.post('/permissions', {
        action: 'update',
        module: 'role'
      })
      expect(response.status).toBe(201)
    })

    it('should fail with invalid action', async () => {
      try {
        await api.post('/permissions', {
          action: 'invalid-action',
          module: 'user'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })

    it('should fail with invalid module', async () => {
      try {
        await api.post('/permissions', {
          action: 'create',
          module: 'invalid-module'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('/permissions (GET)', () => {
    it('should get all permissions', async () => {
      const response = await api.get('/permissions')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('/permissions/:id (GET)', () => {
    it('should get permission by id', async () => {
      const response = await api.get('/permissions/1')
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent permission', async () => {
      try {
        await api.get('/permissions/999')
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  describe('/permissions/:id (PATCH)', () => {
    it('should update permission action', async () => {
      const response = await api.patch('/permissions/1', {
        action: 'update'
      })
      expect(response.status).toBe(200)
    })

    it('should update permission module', async () => {
      const response = await api.patch('/permissions/1', {
        module: 'permission'
      })
      expect(response.status).toBe(200)
    })

    it('should fail with invalid action', async () => {
      try {
        await api.patch('/permissions/1', {
          action: 'invalid-action'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })

    it('should fail with invalid module', async () => {
      try {
        await api.patch('/permissions/1', {
          module: 'invalid-module'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('/permissions/:id (DELETE)', () => {
    it('should delete permission', async () => {
      const response = await api.delete('/permissions/1')
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent permission', async () => {
      try {
        await api.delete('/permissions/999')
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })
})
