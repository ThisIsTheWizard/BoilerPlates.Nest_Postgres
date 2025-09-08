import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string
    email: string
    roles?: string[]
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private commonService: CommonService,
    private prisma: PrismaService
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        throw new UnauthorizedException('UNAUTHORIZED')
      }

      const decoded = this.commonService.verifyJWTToken(token) as { user_id: string; email: string }
      const { user_id, email } = decoded

      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
        include: {
          role_users: {
            include: { role: true }
          }
        }
      })

      if (!user) {
        throw new UnauthorizedException('USER_NOT_FOUND')
      }

      req.user = {
        user_id,
        email,
        roles: user.role_users.map((ru) => ru.role.name)
      }

      next()
    } catch {
      throw new UnauthorizedException('UNAUTHORIZED')
    }
  }
}
