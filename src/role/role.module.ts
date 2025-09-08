import { Module } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'
import { RoleController } from '@/role/role.controller'
import { RoleService } from '@/role/role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService],
  exports: [RoleService]
})
export class RoleModule {}
