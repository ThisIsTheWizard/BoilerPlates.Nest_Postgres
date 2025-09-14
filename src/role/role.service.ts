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
}
