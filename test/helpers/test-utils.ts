import { INestApplication } from '@nestjs/common'

const request = require('supertest')

export class TestUtils {
  static async createTestUser(app: INestApplication, email = 'test@example.com') {
    const response = await request(app.getHttpServer()).post('/users/register').send({
      email,
      password: 'Test123!@#',
      first_name: 'Test',
      last_name: 'User'
    })

    return response.body
  }

  static async loginUser(app: INestApplication, email = 'test@example.com', password = 'Test123!@#') {
    const response = await request(app.getHttpServer()).post('/users/login').send({ email, password })

    return response.body
  }

  static async createTestRole(app: INestApplication, name: 'admin' | 'developer' | 'moderator' | 'user' = 'user') {
    const response = await request(app.getHttpServer()).post('/roles').send({ name })

    return response.body
  }

  static async createTestPermission(
    app: INestApplication,
    action: 'create' | 'read' | 'update' | 'delete' = 'read',
    module: 'permission' | 'role' | 'role_permission' | 'role_user' | 'user' = 'user'
  ) {
    const response = await request(app.getHttpServer()).post('/permissions').send({ action, module })

    return response.body
  }

  static generateUUID(): string {
    return '123e4567-e89b-12d3-a456-426614174000'
  }

  static getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` }
  }
}
