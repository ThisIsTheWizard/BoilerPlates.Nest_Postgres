import axios from 'axios'

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8000}`,
  timeout: 10000
})

let authToken = null

beforeAll(async () => {
  try {
    // Seed roles and permissions
    await api.post('/roles/seed')
    await api.post('/permissions/seed')
    
    // Create test user
    await api.post('/users/register', {
      email: 'test@test.com',
      password: 'Test123!@#',
      first_name: 'Test',
      last_name: 'User'
    })
    
    // Login to get auth token
    const loginResponse = await api.post('/users/login', {
      email: 'test@test.com',
      password: 'Test123!@#'
    })
    authToken = loginResponse?.data?.token
  } catch (error) {
    // Ignore setup errors for now
  }
})

export { api, authToken }
