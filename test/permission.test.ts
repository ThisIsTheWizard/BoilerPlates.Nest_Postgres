import { getTestRequest } from './setup'

describe('PermissionController (e2e)', () => {
  describe('/permissions (POST)', () => {
    it('should create a new permission', () =>
      getTestRequest()
        .post('/permissions')
        .send({
          action: 'create',
          module: 'user',
          created_by: '123e4567-e89b-12d3-a456-426614174000'
        })
        .expect(201))

    it('should create permission without created_by', () =>
      getTestRequest()
        .post('/permissions')
        .send({
          action: 'read',
          module: 'role'
        })
        .expect(201))

    it('should fail with invalid action', () =>
      getTestRequest()
        .post('/permissions')
        .send({
          action: 'invalid-action',
          module: 'user'
        })
        .expect(400))

    it('should fail with invalid module', () =>
      getTestRequest()
        .post('/permissions')
        .send({
          action: 'create',
          module: 'invalid-module'
        })
        .expect(400))
  })

  describe('/permissions (GET)', () => {
    it('should get all permissions', () =>
      getTestRequest()
        .get('/permissions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        }))
  })

  describe('/permissions/:id (GET)', () => {
    it('should get permission by id', () =>
      getTestRequest().get('/permissions/123e4567-e89b-12d3-a456-426614174000').expect(200))

    it('should return 404 for non-existent permission', () =>
      getTestRequest().get('/permissions/non-existent-id').expect(404))
  })

  describe('/permissions/:id (PATCH)', () => {
    it('should update permission action', () =>
      getTestRequest()
        .patch('/permissions/123e4567-e89b-12d3-a456-426614174000')
        .send({
          action: 'update'
        })
        .expect(200))

    it('should update permission module', () =>
      getTestRequest()
        .patch('/permissions/123e4567-e89b-12d3-a456-426614174000')
        .send({
          module: 'permission'
        })
        .expect(200))

    it('should fail with invalid action', () =>
      getTestRequest()
        .patch('/permissions/123e4567-e89b-12d3-a456-426614174000')
        .send({
          action: 'invalid-action'
        })
        .expect(400))

    it('should fail with invalid module', () =>
      getTestRequest()
        .patch('/permissions/123e4567-e89b-12d3-a456-426614174000')
        .send({
          module: 'invalid-module'
        })
        .expect(400))
  })

  describe('/permissions/:id (DELETE)', () => {
    it('should delete permission', () =>
      getTestRequest().delete('/permissions/123e4567-e89b-12d3-a456-426614174000').expect(200))

    it('should return 404 for non-existent permission', () =>
      getTestRequest().delete('/permissions/non-existent-id').expect(404))
  })
})
