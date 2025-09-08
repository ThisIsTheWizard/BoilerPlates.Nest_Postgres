import { Injectable } from '@nestjs/common'

import { CreatePermissionDto, UpdatePermissionDto } from '@/permission/permission.dto'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePermissionDto) {
    return this.prisma.permission.create({ data })
  }

  async findAll() {
    return this.prisma.permission.findMany()
  }

  async findOne(id: string) {
    return this.prisma.permission.findUnique({ where: { id } })
  }

  async update(id: string, data: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data })
  }

  async remove(id: string) {
    return this.prisma.permission.delete({ where: { id } })
  }
}
