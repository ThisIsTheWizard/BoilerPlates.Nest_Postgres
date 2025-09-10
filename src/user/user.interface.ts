export interface LoginResponse {
  user: UserResponse
  token: string
}

export interface UserResponse {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  status?: string
}

export interface MessageResponse {
  message: string
  success?: boolean
}
