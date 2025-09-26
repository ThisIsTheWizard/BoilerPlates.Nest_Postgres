import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from '@/app/app.controller'
import { AppService } from '@/app/app.service'
import { CommonService } from '@/common/common.service'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { PermissionModule } from '@/permission/permission.module'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleModule } from '@/role/role.module'
import { TestController } from '@/test/test.controller'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, RoleModule, PermissionModule],
  controllers: [AppController, TestController],
  providers: [AppService, PrismaService, AuthMiddleware, CommonService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { method: RequestMethod.POST, path: 'test/setup' },
        { method: RequestMethod.POST, path: 'users/login' },
        { method: RequestMethod.POST, path: 'users/register' }
      )
      .forRoutes('*')
  }
}
