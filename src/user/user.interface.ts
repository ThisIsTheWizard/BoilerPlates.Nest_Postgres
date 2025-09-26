
import { Prisma, User } from '@prisma/client'

export type UserResponse = Pick<User, 'id' | 'email' | 'status'> & {
  first_name?: string | null
  last_name?: string | null
}

export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    role_users: {
      include: {
        role: true
      }
    }
  }
}>
