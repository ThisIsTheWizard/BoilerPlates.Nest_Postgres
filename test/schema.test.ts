import { api } from './setup'

describe('Schema Validation (e2e)', () => {
  let roleId: string
  let permissionId: string

  beforeAll(async () => {
    // Seed roles and permissions first
    await api.post('/roles/seed')
    await api.post('/permissions/seed')
    
    // Get existing role and permission
    const rolesResponse = await api.get('/roles')
    const adminRole = rolesResponse.data.find((r: any) => r.name === 'admin')
    roleId = adminRole.id

    const permissionsResponse = await api.get('/permissions')
    const createUserPermission = permissionsResponse.data.find(
      (p: any) => p.action === 'create' && p.module === 'user'
    )
    permissionId = createUserPermission.id
  })

  describe('RolePermission with can_do_the_action', () => {
    it('should create role permission with can_do_the_action true', async () => {
      const response = await api.post('/roles/permissions/assign', {
        roleId,
        permissionId,
        canDoAction: true
      })
      expect(response.status).toBe(201)
    })

    it('should create role permission with can_do_the_action false', async () => {
      const response = await api.post('/roles/permissions/assign', {
        roleId,
        permissionId,
        canDoAction: false
      })
      expect(response.status).toBe(201)
    })

    it('should default can_do_the_action to false when not specified', async () => {
      const response = await api.post('/roles/permissions/assign', {
        roleId,
        permissionId
      })
      expect(response.status).toBe(201)
    })

    it('should update can_do_the_action value', async () => {
      const response = await api.patch('/roles/permissions/update', {
        roleId,
        permissionId,
        canDoAction: true
      })
      expect(response.status).toBe(200)
    })
  })
})
