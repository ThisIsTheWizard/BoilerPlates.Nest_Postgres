import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from '@/app/app.controller'
import { AppService } from '@/app/app.service'
import { PermissionModule } from '@/permission/permission.module'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleModule } from '@/role/role.module'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, RoleModule, PermissionModule],
  controllers: [AppController],
  providers: [AppService, PrismaService]
})
export class AppModule {}
