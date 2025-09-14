import { Controller, Post } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'
import { RoleService } from '@/role/role.service'
import { UserService } from '@/user/user.service'

@Controller('test')
export class TestController {
  constructor(
    private prisma: PrismaService,
    private roleService: RoleService,
    private userService: UserService
  ) {}

  @Post('setup')
  async setup() {
    await this.prisma.rolePermission.deleteMany({})
    await this.prisma.roleUser.deleteMany({})
    await this.prisma.authToken.deleteMany({})
    await this.prisma.verificationToken.deleteMany({})
    await this.prisma.permission.deleteMany({})
    await this.prisma.role.deleteMany({})
    await this.prisma.user.deleteMany({})

    const roles = await this.roleService.seedSystemRoles()
    const users = await this.userService.seedTestUsers()

    return { roles, users }
  }
}
