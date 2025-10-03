import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleName } from '@prisma/client'
import { Request } from 'express'

import { RequestUser } from '@/auth/auth.interface'
import { ROLES_KEY } from '@/decorators/roles.decorator'

interface AuthenticatedRequest extends Request {
  user?: RequestUser
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userRoles = request.user?.roles ?? []

    const hasRole = requiredRoles.some((role) => userRoles.includes(role))
    if (!hasRole) {
      throw new ForbiddenException('INSUFFICIENT_ROLE')
    }

    return true
  }
}
