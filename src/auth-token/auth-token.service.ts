import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthTokenService {
  constructor(private prisma: PrismaService) {}

  async createAuthToken(userId: string, token: string, expiredAt: Date) {
    return this.prisma.authToken.create({
      data: { user_id: userId, token, expired_at: expiredAt }
    })
  }

  async deleteAuthTokens(userId: string) {
    return this.prisma.authToken.deleteMany({
      where: { user_id: userId }
    })
  }

  async revokeAuthToken(token: string) {
    try {
      return this.prisma.authToken.delete({
        where: { token }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Token not found')
      }
      throw error
    }
  }

  async verifyAuthToken(token: string) {
    return this.prisma.authToken.findUnique({
      where: { token },
      include: { user: true }
    })
  }

  async validateRefreshToken(refreshToken: string, userId: string): Promise<boolean> {
    const token = await this.prisma.authToken.findFirst({
      where: {
        token: refreshToken,
        user_id: userId,
        expired_at: { gt: new Date() }
      }
    })
    return !!token
  }

  async updateRefreshToken(oldToken: string, newToken: string) {
    return this.prisma.authToken.update({
      where: { token: oldToken },
      data: { token: newToken }
    })
  }
}
