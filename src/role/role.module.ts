import { Module } from '@nestjs/common'

import { CommonService } from '@/common/common.service'
import { AuthGuard } from '@/guards/auth.guard'
import { PermissionsGuard } from '@/guards/permissions.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { PrismaService } from '../prisma/prisma.service'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService, CommonService, AuthGuard, RolesGuard, PermissionsGuard],
  exports: [RoleService]
})
export class RoleModule {}
