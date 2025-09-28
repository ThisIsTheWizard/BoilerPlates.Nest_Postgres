import { api, authToken } from './setup'

describe('UserController (e2e)', () => {
  describe('/users/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await api.post('/users/register', {
        email: `newuser${Date.now()}@example.com`,
        password: 'Test123!@#',
        first_name: 'John',
        last_name: 'Doe'
      })
      expect(response.status).toBe(201)
    })

    it('should fail with invalid email', async () => {
      try {
        await api.post('/users/register', {
          email: 'invalid-email',
          password: 'Test123!@#'
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(400)
      }
    })
  })

  describe('/users/verify-user-email (POST)', () => {
    it('should handle email verification', async () => {
      try {
        await api.post('/users/verify-user-email', {
          email: 'test@test.com',
          token: 'invalid-token'
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(400)
      }
    })
  })

  describe('/users/resend-verification-email (POST)', () => {
    it('should resend verification email', async () => {
      const response = await api.post('/users/resend-verification-email', {
        email: 'test@test.com'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/users/login (POST)', () => {
    it('should login user', async () => {
      const response = await api.post('/users/login', {
        email: 'test@test.com',
        password: 'Test123!@#'
      })
      expect(response.status).toBe(201)
      expect(response.data.token).toBeDefined()
    })

    it('should fail with wrong credentials', async () => {
      try {
        await api.post('/users/login', {
          email: 'test@test.com',
          password: 'wrongpassword'
        })
        expect(true).toBe(false) // Should not reach here
      } catch (error: any) {
        expect(error.response?.status).toBe(401)
      }
    })
  })

  describe('/users/refresh-token (POST)', () => {
    it('should refresh token', async () => {
      const response = await api.post('/users/refresh-token', {
        access_token: 'access-token',
        refresh_token: 'refresh-token'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/users/me (GET)', () => {
    it('should get current user', async () => {
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      expect(response.status).toBe(200)
    })
  })

  describe('/users/logout (POST)', () => {
    it('should logout user', async () => {
      const response = await api.post(
        '/users/logout',
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      )
      expect(response.status).toBe(201)
    })
  })

  describe('/users/change-email (POST)', () => {
    it('should change email', async () => {
      const response = await api.post(
        '/users/change-email',
        {
          email: 'newemail@example.com'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      )
      expect(response.status).toBe(201)
    })
  })

  describe('/users/forgot-password (POST)', () => {
    it('should send forgot password email', async () => {
      const response = await api.post('/users/forgot-password', {
        email: 'test@test.com'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/users (GET)', () => {
    it('should get all users', async () => {
      const response = await api.get('/users')
      expect(response.status).toBe(200)
    })
  })

  describe('/users (POST)', () => {
    it('should create user', async () => {
      const response = await api.post('/users', {
        email: `admin${Date.now()}@example.com`,
        password: 'Admin123!@#',
        first_name: 'Admin',
        status: 'active'
      })
      expect(response.status).toBe(201)
    })
  })

  describe('/users/:id (GET)', () => {
    it('should get user by id', async () => {
      const response = await api.get('/users/1')
      expect(response.status).toBe(200)
    })
  })

  describe('/users/:id (PATCH)', () => {
    it('should update user', async () => {
      const response = await api.patch('/users/1', {
        first_name: 'Updated Name'
      })
      expect(response.status).toBe(200)
    })
  })

  describe('/users/:id (DELETE)', () => {
    it('should delete user', async () => {
      const response = await api.delete('/users/1')
      expect(response.status).toBe(200)
    })
  })

  describe('/users/register (POST) - Role Assignment', () => {
    it('should assign user role on registration', async () => {
      const registerResponse = await api.post('/users/register', {
        email: 'roletest@example.com',
        password: 'Test123!@#',
        first_name: 'Role',
        last_name: 'Test'
      })
      expect(registerResponse.status).toBe(201)

      const userResponse = await api.get(`/users/${registerResponse.data.id}`)
      expect(userResponse.data.role_users).toHaveLength(1)
      expect(userResponse.data.role_users[0].role.name).toBe('user')
    })
  })

  describe('/users/:id/roles/:role_name (POST)', () => {
    it('should assign role to user', async () => {
      const response = await api.post('/users/1/roles/admin')
      expect(response.status).toBe(201)
    })
  })

  describe('/users/:id/roles/:role_name (DELETE)', () => {
    it('should revoke role from user', async () => {
      const response = await api.delete('/users/1/roles/admin')
      expect(response.status).toBe(200)
    })
  })
})
