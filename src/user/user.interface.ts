export interface LoginResponse {
  user: UserResponse
  token: string
}

export interface UserResponse {
  id: string
  email: string
  first_name?: string
  last_name?: string
  status?: string
}

export interface MessageResponse {
  message: string
  success?: boolean
}
