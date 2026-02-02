import { PermissionAction, PermissionModule } from '@prisma/client'

import { api, getAuthHeaders, loginAndGetTokens, prisma, resetDatabase } from './setup'

describe('PermissionController (integration)', () => {
  let accessToken: string

  beforeAll(async () => {
    await resetDatabase()
    const tokens = await loginAndGetTokens('admin@wizardcld.com', 'password')
    accessToken = tokens.access_token
  })

  describe('POST /permissions', () => {
    it('success', async () => {
      // First delete the permission if it exists to ensure we can create it
      const existing = await prisma.permission.findFirst({
        where: { action: PermissionAction.create, module: PermissionModule.role_permission }
      })
      if (existing) {
        await prisma.permission.delete({ where: { id: existing.id } })
      }

      const response = await api.post(
        '/permissions',
        { action: PermissionAction.create, module: PermissionModule.role_permission },
        getAuthHeaders(accessToken)
      )

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ action: PermissionAction.create, module: PermissionModule.role_permission })
    })

    it('error', async () => {
      const response = await api.post(
        '/permissions',
        { action: 'invalid-action', module: PermissionModule.role_permission },
        getAuthHeaders(accessToken)
      )

      expect(response.status).toBe(400)
    })
  })

  describe('GET /permissions', () => {
    it('success', async () => {
      const response = await api.get('/permissions', getAuthHeaders(accessToken))

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeGreaterThan(0)
    })

    it('error', async () => {
      const response = await api.get('/permissions')
      expect(response.status).toBe(401)
    })
  })

  describe('GET /permissions/:id', () => {
    it('success', async () => {
      const { data } = await api.get('/permissions', getAuthHeaders(accessToken))
      const permissionId = data?.[0]?.id
      expect(permissionId).toBeDefined()

      const response = await api.get(`/permissions/${permissionId}`, getAuthHeaders(accessToken))

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: permissionId })
    })

    it('error', async () => {
      const response = await api.get('/permissions/non-existent-id', getAuthHeaders(accessToken))
      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /permissions/:id', () => {
    it('success', async () => {
      // Get an existing permission to update (don't change action/module to avoid unique constraint)
      const { data } = await api.get('/permissions', getAuthHeaders(accessToken))
      const permissionId = data?.[0]?.id
      expect(permissionId).toBeDefined()

      // Just test that the endpoint works by updating the same permission
      const response = await api.patch(
        `/permissions/${permissionId}`,
        { action: data[0].action, module: data[0].module },
        getAuthHeaders(accessToken)
      )

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: permissionId })
    })

    it('error', async () => {
      const response = await api.patch(
        '/permissions/non-existent-id',
        { action: PermissionAction.delete },
        getAuthHeaders(accessToken)
      )

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /permissions/:id', () => {
    it('success', async () => {
      const { data } = await api.get('/permissions', getAuthHeaders(accessToken))
      const permissionId = data?.[0]?.id
      expect(permissionId).toBeDefined()

      const response = await api.delete(`/permissions/${permissionId}`, getAuthHeaders(accessToken))

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: permissionId })
    })

    it('error', async () => {
      const response = await api.delete('/permissions/non-existent-id', getAuthHeaders(accessToken))
      expect(response.status).toBe(404)
    })
  })
})
