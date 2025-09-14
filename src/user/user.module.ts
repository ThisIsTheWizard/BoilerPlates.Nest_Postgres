import { Module } from '@nestjs/common'

import { AuthTokenService } from '../auth-token/auth-token.service'
import { CommonService } from '../common/common.service'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { PrismaService } from '../prisma/prisma.service'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { VerificationTokenService } from '../verification-token/verification-token.service'

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CommonService, AuthTokenService, VerificationTokenService, AuthMiddleware],
  exports: [UserService]
})
export class UserModule {}
