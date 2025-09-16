import { api } from './setup'

describe('RoleController (e2e)', () => {
  describe('/roles (POST)', () => {
    it('should create a new role', async () => {
      const response = await api.post('/roles', {
        name: 'developer'
      })
      expect(response.status).toBe(201)
    })

    it('should create role without created_by', async () => {
      const response = await api.post('/roles', {
        name: 'user'
      })
      expect(response.status).toBe(201)
    })

    it('should fail with invalid role name', async () => {
      try {
        await api.post('/roles', {
          name: 'invalid-role'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('/roles (GET)', () => {
    it('should get all roles', async () => {
      const response = await api.get('/roles')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('/roles/:id (GET)', () => {
    it('should get role by id', async () => {
      const response = await api.get('/roles/1')
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent role', async () => {
      try {
        await api.get('/roles/999')
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  describe('/roles/:id (PATCH)', () => {
    it('should update role', async () => {
      const response = await api.patch('/roles/1', {
        name: 'moderator'
      })
      expect(response.status).toBe(200)
    })

    it('should fail with invalid role name', async () => {
      try {
        await api.patch('/roles/1', {
          name: 'invalid-role'
        })
      } catch (error) {
        expect(error.response.status).toBe(400)
      }
    })
  })

  describe('/roles/:id (DELETE)', () => {
    it('should delete role', async () => {
      const response = await api.delete('/roles/1')
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent role', async () => {
      try {
        await api.delete('/roles/999')
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })
  })

  describe('/roles/seed (POST)', () => {
    it('should seed system roles', async () => {
      const response = await api.post('/roles/seed')
      expect(response.status).toBe(201)
    })
  })

  describe('/roles/permissions/assign (POST)', () => {
    it('should assign permission to role', async () => {
      const response = await api.post('/roles/permissions/assign', {
        roleId: '1',
        permissionId: '1',
        canDoAction: true
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/roles/permissions/revoke (POST)', () => {
    it('should revoke permission from role', async () => {
      const response = await api.post('/roles/permissions/revoke', {
        roleId: '1',
        permissionId: '1'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/roles/permissions/update (PATCH)', () => {
    it('should update role permission', async () => {
      const response = await api.patch('/roles/permissions/update', {
        roleId: '1',
        permissionId: '1',
        canDoAction: false
      })
      expect(response.status).toBe(200)
    })
  })
})
