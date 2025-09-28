import { Injectable } from '@nestjs/common'
import { Prisma, Role, RoleName } from '@prisma/client'
import { map } from 'lodash'

import { AuthTokenService } from '@/auth-token/auth-token.service'
import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleService } from '@/role/role.service'
import { CreateUserDto, UpdateUserDto } from '@/user/user.dto'
import { VerificationTokenService } from '@/verification-token/verification-token.service'

@Injectable()
export class UserService {
  constructor(
    private authTokenService: AuthTokenService,
    private commonService: CommonService,
    private prismaService: PrismaService,
    private roleService: RoleService,
    private verificationTokenService: VerificationTokenService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.commonService.hashPassword(createUserDto.password)
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword
      }
    })
  }

  async findAll() {
    return this.prismaService.user.findMany({
      include: {
        role_users: {
          include: {
            role: true
          }
        }
      }
    })
  }

  async findOne(options: Prisma.UserFindUniqueArgs) {
    return this.prismaService.user.findUnique({
      ...options,
      include: { ...options?.include, role_users: { include: { role: true } } }
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return this.prismaService.user.update({
        where: { id },
        data: updateUserDto
      })
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }

  async seedTestUsers(roles: Role[]) {
    const userRole = roles.find((r) => r.name === 'user')
    const hashedPassword = await this.commonService.hashPassword('password')
    const users = await this.prismaService.user.createManyAndReturn({
      data: [
        {
          email: 'test-1@test.com',
          first_name: 'Test',
          last_name: 'User 1',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-2@test.com',
          first_name: 'Test',
          last_name: 'User 2',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-3@test.com',
          first_name: 'Test',
          last_name: 'User 3',
          password: hashedPassword,
          status: 'active'
        }
      ]
    })
    await this.prismaService.roleUser.createManyAndReturn({
      data: map(users, (u) => ({ user_id: u.id, role_id: userRole?.id! }))
    })

    return users
  }

  async remove(id: string) {
    try {
      return this.prismaService.user.delete({
        where: { id }
      })
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }

  async assignRole(user_id: string, role_name: string) {
    if (!Object.values(RoleName).includes(role_name as RoleName)) {
      throw new Error('INVALID_ROLE_NAME')
    }

    const role = await this.roleService.findOne({ where: { name: role_name as RoleName } })
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    return this.prismaService.roleUser.upsert({
      where: {
        user_id_role_id: {
          user_id,
          role_id: role.id
        }
      },
      update: {},
      create: {
        user_id,
        role_id: role.id
      }
    })
  }

  async revokeRole(user_id: string, role_name: string) {
    if (!Object.values(RoleName).includes(role_name as RoleName)) {
      throw new Error('INVALID_ROLE_NAME')
    }

    const role = await this.roleService.findOne({ where: { name: role_name as RoleName } })
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    return this.prismaService.roleUser.delete({
      where: {
        user_id_role_id: {
          user_id,
          role_id: role.id
        }
      }
    })
  }
}
