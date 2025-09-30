import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/prisma/prisma.service'
import { RoleService } from '@/role/role.service'
import { TestController } from '@/test/test.controller'
import { UserService } from '@/user/user.service'

describe('TestController', () => {
  let controller: TestController
  let prismaService: {
    rolePermission: { deleteMany: jest.Mock }
    roleUser: { deleteMany: jest.Mock }
    authToken: { deleteMany: jest.Mock }
    verificationToken: { deleteMany: jest.Mock }
    permission: { deleteMany: jest.Mock }
    role: { deleteMany: jest.Mock }
    user: { deleteMany: jest.Mock }
  }
  let roleService: jest.Mocked<RoleService>
  let userService: jest.Mocked<UserService>

  beforeEach(async () => {
    prismaService = {
      rolePermission: { deleteMany: jest.fn() },
      roleUser: { deleteMany: jest.fn() },
      authToken: { deleteMany: jest.fn() },
      verificationToken: { deleteMany: jest.fn() },
      permission: { deleteMany: jest.fn() },
      role: { deleteMany: jest.fn() },
      user: { deleteMany: jest.fn() }
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        { provide: PrismaService, useValue: prismaService },
        {
          provide: RoleService,
          useValue: {
            seedSystemRoles: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            seedTestUsers: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<TestController>(TestController)
    roleService = module.get<RoleService>(RoleService) as jest.Mocked<RoleService>
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('setup', () => {
    it('success', async () => {
      const roles = [{ id: 'role-1' }]
      const users = [{ id: 'user-1' }]
      Object.values(prismaService).forEach((model) => {
        model.deleteMany.mockResolvedValue(undefined)
      })
      roleService.seedSystemRoles.mockResolvedValue(roles as any)
      userService.seedTestUsers.mockResolvedValue(users as any)

      await expect(controller.setup()).resolves.toEqual({ roles, users })
      Object.values(prismaService).forEach((model) => {
        expect(model.deleteMany).toHaveBeenCalledTimes(1)
      })
      expect(roleService.seedSystemRoles).toHaveBeenCalledTimes(1)
      expect(userService.seedTestUsers).toHaveBeenCalledWith(roles)
    })

    it('error', async () => {
      const error = new Error('teardown failed')
      prismaService.rolePermission.deleteMany.mockRejectedValue(error)

      await expect(controller.setup()).rejects.toThrow(error)
      expect(prismaService.rolePermission.deleteMany).toHaveBeenCalledTimes(1)
    })
  })
})
