import { Module } from '@nestjs/common'

import { CommonService } from '@/common/common.service'
import { AuthGuard } from '@/guards/auth.guard'
import { PermissionsGuard } from '@/guards/permissions.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { PermissionController } from '@/permission/permission.controller'
import { PermissionService } from '@/permission/permission.service'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PrismaService, CommonService, AuthGuard, RolesGuard, PermissionsGuard],
  exports: [PermissionService]
})
export class PermissionModule {}
