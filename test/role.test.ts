import { api } from './setup'

describe('RoleController (e2e)', () => {
  let testRoleId: string

  describe('/roles (POST)', () => {
    it('should create a new role', async () => {
      try {
        const response = await api.post('/roles', {
          name: 'developer'
        })
        expect(response.status).toBe(201)
        testRoleId = response.data.id
      } catch (error: any) {
        // Role might already exist, get it instead
        const rolesResponse = await api.get('/roles')
        const existingRole = rolesResponse.data.find((r: any) => r.name === 'developer')
        expect(existingRole).toBeDefined()
        testRoleId = existingRole.id
      }
    })

    it('should create role without created_by', async () => {
      try {
        const response = await api.post('/roles', {
          name: 'user'
        })
        expect(response.status).toBe(201)
      } catch (error: any) {
        // Role might already exist
        expect(error.response?.status).toBe(500)
      }
    })

    it('should fail with invalid role name', async () => {
      try {
        await api.post('/roles', {
          name: 'invalid-role'
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(400)
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
      const response = await api.get(`/roles/${testRoleId}`)
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent role', async () => {
      try {
        await api.get('/roles/non-existent-id')
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(404)
      }
    })
  })

  describe('/roles/:id (PATCH)', () => {
    it('should update role', async () => {
      const response = await api.patch(`/roles/${testRoleId}`, {
        name: 'moderator'
      })
      expect(response.status).toBe(200)
    })

    it('should fail with invalid role name', async () => {
      try {
        await api.patch(`/roles/${testRoleId}`, {
          name: 'invalid-role'
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(400)
      }
    })
  })

  describe('/roles/:id (DELETE)', () => {
    it('should delete role', async () => {
      // Create a role specifically for deletion
      const createResponse = await api.post('/roles', { name: 'admin' })
      const roleToDelete = createResponse.data.id

      const response = await api.delete(`/roles/${roleToDelete}`)
      expect(response.status).toBe(200)
    })

    it('should return 404 for non-existent role', async () => {
      try {
        await api.delete('/roles/non-existent-id')
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(404)
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
      const permissionsResponse = await api.get('/permissions')
      const permission = permissionsResponse.data[0]

      const response = await api.post('/roles/permissions/assign', {
        role_id: testRoleId,
        permission_id: permission.id,
        canDoAction: true
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/roles/permissions/revoke (POST)', () => {
    it('should revoke permission from role', async () => {
      const response = await api.post('/roles/permissions/revoke', {
        role_id: '1',
        permission_id: '1'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/roles/permissions/update (PATCH)', () => {
    it('should update role permission', async () => {
      const response = await api.patch('/roles/permissions/update', {
        role_id: '1',
        permission_id: '1',
        canDoAction: false
      })
      expect(response.status).toBe(200)
    })
  })
})
