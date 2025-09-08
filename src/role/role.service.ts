import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'
import { CreateRoleDto, UpdateRoleDto } from '@/role/role.dto'

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
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        role_users: { include: { user: true } },
        role_permissions: { include: { permission: true } }
      }
    })
  }

  async update(id: string, data: UpdateRoleDto) {
    return this.prisma.role.update({ where: { id }, data })
  }

  async remove(id: string) {
    return this.prisma.role.delete({ where: { id } })
  }
}
