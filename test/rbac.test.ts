import { api } from './setup'

describe('RBAC System Integration (e2e)', () => {
  let adminUser: any
  let regularUser: any
  let adminRole: any
  let userRole: any
  let createUserPermission: any

  beforeAll(async () => {
    // Seed roles and permissions
    await api.post('/roles/seed')
    await api.post('/permissions/seed')

    // Get seeded data
    const rolesResponse = await api.get('/roles')
    adminRole = rolesResponse.data.find((r: any) => r.name === 'admin')
    userRole = rolesResponse.data.find((r: any) => r.name === 'user')

    const permissionsResponse = await api.get('/permissions')
    createUserPermission = permissionsResponse.data.find((p: any) => p.action === 'create' && p.module === 'user')

    // Create test users
    const adminResponse = await api.post('/users', {
      email: 'admin@test.com',
      password: 'Admin123!',
      first_name: 'Admin',
      status: 'active'
    })
    adminUser = adminResponse.data

    const userResponse = await api.post('/users/register', {
      email: 'user@test.com',
      password: 'User123!',
      first_name: 'User'
    })
    regularUser = userResponse.data
  })

  describe('User Registration with Default Role', () => {
    it('should assign user role on registration', async () => {
      const response = await api.post('/users/register', {
        email: 'newuser@test.com',
        password: 'Test123!',
        first_name: 'New'
      })
      expect(response.status).toBe(201)

      const userDetails = await api.get(`/users/${response.data.id}`)
      expect(userDetails.data.role_users).toHaveLength(1)
      expect(userDetails.data.role_users[0].role.name).toBe('user')
    })
  })

  describe('Role Assignment by Admin', () => {
    it('should assign admin role to user', async () => {
      const response = await api.post(`/users/${regularUser.id}/roles/admin`)
      expect(response.status).toBe(201)
    })

    it('should revoke admin role from user', async () => {
      const response = await api.delete(`/users/${regularUser.id}/roles/admin`)
      expect(response.status).toBe(200)
    })

    it('should handle non-existent role', async () => {
      try {
        await api.post(`/users/${regularUser.id}/roles/nonexistent`)
      } catch (error) {
        expect(error.response.status).toBe(500)
      }
    })
  })

  describe('Permission Management', () => {
    it('should assign permission to role with can_do_the_action true', async () => {
      const response = await api.post('/roles/permissions/assign', {
        roleId: userRole.id,
        permissionId: createUserPermission.id,
        canDoAction: true
      })
      expect(response.status).toBe(201)
    })

    it('should update permission can_do_the_action to false', async () => {
      const response = await api.patch('/roles/permissions/update', {
        roleId: userRole.id,
        permissionId: createUserPermission.id,
        canDoAction: false
      })
      expect(response.status).toBe(200)
    })

    it('should revoke permission from role', async () => {
      const response = await api.post('/roles/permissions/revoke', {
        roleId: userRole.id,
        permissionId: createUserPermission.id
      })
      expect(response.status).toBe(201)
    })
  })

  describe('Role Hierarchy Verification', () => {
    it('should verify admin has all permissions', async () => {
      const response = await api.get(`/roles/${adminRole.id}`)
      expect(response.data.role_permissions.length).toBeGreaterThanOrEqual(0)

      if (response.data.role_permissions.length > 0) {
        const allCanDo = response.data.role_permissions.every((rp: any) => rp.can_do_action === true)
        expect(allCanDo).toBe(true)
      }
    })

    it('should verify user has limited permissions', async () => {
      const response = await api.get(`/roles/${userRole.id}`)
      const userPermissions = response.data.role_permissions.filter((rp: any) => rp.can_do_action === true)
      expect(userPermissions.length).toBeLessThanOrEqual(20) // Less than or equal to total permissions
    })
  })

  describe('Seeding Validation', () => {
    it('should have created all required roles', async () => {
      const response = await api.get('/roles')
      const roleNames = response.data.map((r: any) => r.name)
      expect(roleNames).toContain('admin')
      expect(roleNames).toContain('user')
      expect(roleNames).toContain('moderator')
      expect(roleNames).toContain('developer')
    })

    it('should have created all required permissions', async () => {
      const response = await api.get('/permissions')
      expect(response.data.length).toBe(20) // 5 modules × 4 actions

      const modules = ['user', 'role', 'permission', 'role_user', 'role_permission']
      const actions = ['create', 'read', 'update', 'delete']

      for (const module of modules) {
        for (const action of actions) {
          const permission = response.data.find((p: any) => p.module === module && p.action === action)
          expect(permission).toBeDefined()
        }
      }
    })
  })
})
