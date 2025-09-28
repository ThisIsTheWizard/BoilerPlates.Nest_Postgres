import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRoleDto, ManagePermissionDto, UpdateRoleDto } from './role.dto'

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(params: CreateRoleDto) {
    return this.prisma.role.create({ data: params })
  }

  async findAll(options: Prisma.RoleFindManyArgs) {
    if (!options.include) {
      options.include = {
        role_permissions: { include: { permission: true } },
        role_users: { include: { user: true } }
      }
    }

    return this.prisma.role.findMany(options)
  }

  async findOne(options: Prisma.RoleFindUniqueArgs) {
    if (!options.include) {
      options.include = {
        role_permissions: { include: { permission: true } },
        role_users: { include: { user: true } }
      }
    }

    return this.prisma.role.findUnique(options)
  }

  async update(id: string, params: UpdateRoleDto) {
    try {
      return this.prisma.role.update({ data: params, where: { id } })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Role not found')
      }
      throw error
    }
  }

  async seedSystemRoles() {
    return this.prisma.role.createManyAndReturn({
      data: [{ name: 'admin' }, { name: 'developer' }, { name: 'moderator' }, { name: 'user' }],
      skipDuplicates: true
    })
  }

  async remove(id: string) {
    try {
      return this.prisma.role.delete({ where: { id } })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Role not found')
      }
      throw error
    }
  }

  async assignPermission(params: ManagePermissionDto) {
    const { can_do_the_action = false, permission_id, role_id } = params || {}

    return this.prisma.rolePermission.upsert({
      create: {
        can_do_the_action,
        permission_id,
        role_id
      },
      update: { can_do_the_action },
      where: {
        role_id_permission_id: {
          permission_id,
          role_id
        }
      }
    })
  }

  async revokePermission(params: ManagePermissionDto) {
    const { permission_id, role_id } = params || {}

    return this.prisma.rolePermission.delete({
      where: {
        role_id_permission_id: {
          permission_id,
          role_id
        }
      }
    })
  }

  async updatePermission(params: ManagePermissionDto) {
    const { can_do_the_action = false, permission_id, role_id } = params || {}

    return this.prisma.rolePermission.update({
      data: { can_do_the_action },
      where: {
        role_id_permission_id: {
          permission_id,
          role_id
        }
      }
    })
  }
}
