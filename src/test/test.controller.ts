import { Controller, Post } from '@nestjs/common'

import { PermissionService } from '@/permission/permission.service'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleService } from '@/role/role.service'
import { UserService } from '@/user/user.service'
import { Permission, Role, RolePermission } from '@prisma/client'

@Controller('test')
export class TestController {
  constructor(
    private permissionService: PermissionService,
    private prisma: PrismaService,
    private roleService: RoleService,
    private userService: UserService
  ) {}

  @Post('setup')
  async setup() {
    if (!(process.env.NODE_ENV === 'test')) {
      throw new Error('FORBIDDEN')
    }

    const collections = ['rolePermission', 'roleUser', 'authToken', 'verificationToken', 'permission', 'role', 'user']

    for (const collection of collections) {
      await this.prisma[collection]?.deleteMany?.({})
    }

    const roles = await this.roleService.seedSystemRoles()
    const permissions = await this.permissionService.seedPermissions()

    await this.seedRolePermissions(roles, permissions)

    const users = await this.userService.seedTestUsers(roles)

    return { roles, users }
  }

  private async seedRolePermissions(roles: Role[], permissions: Permission[]) {
    const rolePermissions: RolePermission[] = []

    for (const role of roles) {
      if (!role?.id) continue

      for (const permission of permissions) {
        if (!permission?.id) continue

        const rolePermission = await this.roleService.assignPermission({
          role_id: role.id,
          permission_id: permission.id,
          can_do_the_action: ['admin', 'developer'].includes(role.name)
        })

        rolePermissions.push(rolePermission)
      }
    }

    return rolePermissions
  }
}
