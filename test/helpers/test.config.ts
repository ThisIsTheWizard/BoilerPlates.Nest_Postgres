export const testConfig = {
  validUser: {
    email: 'test@example.com',
    password: 'Test123!@#',
    first_name: 'John',
    last_name: 'Doe'
  },
  validAdmin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    first_name: 'Admin',
    last_name: 'User'
  },
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  },
  validRole: {
    name: 'admin' as const
  },
  validPermission: {
    action: 'create' as const,
    module: 'user' as const
  },
  testUUID: '123e4567-e89b-12d3-a456-426614174000',
  invalidUUID: 'invalid-uuid'
}
