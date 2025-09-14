import axios from 'axios'

const api = axios.create({
  baseURL: `http://localhost:${process.env.PORT || 8000}`,
  timeout: 10000
})

let authToken = null

beforeAll(async () => {
  try {
    await api.post('/test/setup')
    const loginResponse = await api.post('/users/login', {
      email: 'test@test.com',
      password: 'Test123!@#'
    })
    authToken = loginResponse?.data?.access_token
  } catch (error) {
    console.log(error)
  }
})

export { api, authToken }
