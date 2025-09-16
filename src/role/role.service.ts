import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { PrismaService } from '../prisma/prisma.service'
import { CreateRoleDto, UpdateRoleDto } from './role.dto'

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRoleDto) {
    return this.prisma.role.create({ data })
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        role_users: { include: { user: true } },
        role_permissions: { include: { permission: true } }
      }
    })
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        role_users: { include: { user: true } },
        role_permissions: { include: { permission: true } }
      }
    })
    if (!role) {
      throw new NotFoundException('Role not found')
    }

    return role
  }

  async update(id: string, data: UpdateRoleDto) {
    try {
      return this.prisma.role.update({ where: { id }, data })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Role not found')
      }
      throw error
    }
  }

  async seedSystemRoles() {
    return this.prisma.role.createMany({
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

  async assignPermission(roleId: string, permissionId: string, canDoAction: boolean = true) {
    return this.prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      },
      update: { can_do_the_action: canDoAction },
      create: {
        role_id: roleId,
        permission_id: permissionId,
        can_do_the_action: canDoAction
      }
    })
  }

  async revokePermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      }
    })
  }

  async updatePermission(roleId: string, permissionId: string, canDoAction: boolean) {
    return this.prisma.rolePermission.update({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      },
      data: { can_do_the_action: canDoAction }
    })
  }
}
