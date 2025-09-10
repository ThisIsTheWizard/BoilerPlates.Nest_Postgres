import { getTestRequest } from './setup'

describe('UserController (e2e)', () => {
  describe('/users/register (POST)', () => {
    it('should register a new user', () =>
      getTestRequest()
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          first_name: 'John',
          last_name: 'Doe'
        })
        .expect(201))

    it('should fail with invalid email', () =>
      getTestRequest()
        .post('/users/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#'
        })
        .expect(400))
  })

  describe('/users/verify-user-email (POST)', () => {
    it('should verify user email', () =>
      getTestRequest()
        .post('/users/verify-user-email')
        .send({
          email: 'test@example.com',
          token: 'verification-token'
        })
        .expect(201))
  })

  describe('/users/resend-verification-email (POST)', () => {
    it('should resend verification email', () =>
      getTestRequest()
        .post('/users/resend-verification-email')
        .send({
          email: 'test@example.com'
        })
        .expect(201))
  })

  describe('/users/login (POST)', () => {
    it('should login user', () =>
      getTestRequest()
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#'
        })
        .expect(201))

    it('should fail with wrong credentials', () =>
      getTestRequest()
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401))
  })

  describe('/users/refresh-token (POST)', () => {
    it('should refresh token', () =>
      getTestRequest()
        .post('/users/refresh-token')
        .send({
          access_token: 'access-token',
          refresh_token: 'refresh-token'
        })
        .expect(201))
  })

  describe('/users/me (GET)', () => {
    it('should get current user', () =>
      getTestRequest().get('/users/me').set('Authorization', 'Bearer valid-token').expect(200))
  })

  describe('/users/logout (POST)', () => {
    it('should logout user', () =>
      getTestRequest().post('/users/logout').set('Authorization', 'Bearer valid-token').expect(201))
  })

  describe('/users/change-email (POST)', () => {
    it('should change email', () =>
      getTestRequest()
        .post('/users/change-email')
        .set('Authorization', 'Bearer valid-token')
        .send({
          email: 'newemail@example.com'
        })
        .expect(201))
  })

  describe('/users/forgot-password (POST)', () => {
    it('should send forgot password email', () =>
      getTestRequest()
        .post('/users/forgot-password')
        .send({
          email: 'test@example.com'
        })
        .expect(201))
  })

  describe('/users (GET)', () => {
    it('should get all users', () => getTestRequest().get('/users').expect(200))
  })

  describe('/users (POST)', () => {
    it('should create user', () =>
      getTestRequest()
        .post('/users')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!@#',
          first_name: 'Admin',
          status: 'active'
        })
        .expect(201))
  })

  describe('/users/:id (GET)', () => {
    it('should get user by id', () => getTestRequest().get('/users/123e4567-e89b-12d3-a456-426614174000').expect(200))
  })

  describe('/users/:id (PATCH)', () => {
    it('should update user', () =>
      getTestRequest()
        .patch('/users/123e4567-e89b-12d3-a456-426614174000')
        .send({
          first_name: 'Updated Name'
        })
        .expect(200))
  })

  describe('/users/:id (DELETE)', () => {
    it('should delete user', () => getTestRequest().delete('/users/123e4567-e89b-12d3-a456-426614174000').expect(200))
  })
})
