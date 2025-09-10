import { getTestRequest } from './setup'

describe('RoleController (e2e)', () => {
  describe('/roles (POST)', () => {
    it('should create a new role', () =>
      getTestRequest()
        .post('/roles')
        .send({
          name: 'admin',
          created_by: '123e4567-e89b-12d3-a456-426614174000'
        })
        .expect(201))

    it('should create role without created_by', () =>
      getTestRequest()
        .post('/roles')
        .send({
          name: 'user'
        })
        .expect(201))

    it('should fail with invalid role name', () =>
      getTestRequest()
        .post('/roles')
        .send({
          name: 'invalid-role'
        })
        .expect(400))
  })

  describe('/roles (GET)', () => {
    it('should get all roles', () =>
      getTestRequest()
        .get('/roles')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        }))
  })

  describe('/roles/:id (GET)', () => {
    it('should get role by id', () => getTestRequest().get('/roles/123e4567-e89b-12d3-a456-426614174000').expect(200))

    it('should return 404 for non-existent role', () => getTestRequest().get('/roles/non-existent-id').expect(404))
  })

  describe('/roles/:id (PATCH)', () => {
    it('should update role', () =>
      getTestRequest()
        .patch('/roles/123e4567-e89b-12d3-a456-426614174000')
        .send({
          name: 'moderator'
        })
        .expect(200))

    it('should fail with invalid role name', () =>
      getTestRequest()
        .patch('/roles/123e4567-e89b-12d3-a456-426614174000')
        .send({
          name: 'invalid-role'
        })
        .expect(400))
  })

  describe('/roles/:id (DELETE)', () => {
    it('should delete role', () => getTestRequest().delete('/roles/123e4567-e89b-12d3-a456-426614174000').expect(200))

    it('should return 404 for non-existent role', () => getTestRequest().delete('/roles/non-existent-id').expect(404))
  })
})
