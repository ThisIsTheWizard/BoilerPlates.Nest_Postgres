import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class VerificationTokenService {
  constructor(private prisma: PrismaService) {}

  async createVerificationToken(data: {
    email: string
    token: string
    type: 'user_verification' | 'forgot_password'
    user_id: string
    expired_at: Date
  }) {
    return this.prisma.verificationToken.create({ data })
  }

  async findVerificationToken(email: string, token: string, type: string) {
    return this.prisma.verificationToken.findFirst({
      where: { email, token, type, status: 'unverified' }
    })
  }

  async updateVerificationToken(id: string, data: { status: string }) {
    return this.prisma.verificationToken.update({
      where: { id },
      data
    })
  }

  async deleteVerificationTokens(userId: string, email: string, type: string) {
    return this.prisma.verificationToken.deleteMany({
      where: { user_id: userId, email, type }
    })
  }

  async cancelVerificationTokens(userId: string, type: string) {
    return this.prisma.verificationToken.updateMany({
      where: { user_id: userId, type, status: 'unverified' },
      data: { status: 'cancelled' }
    })
  }

  async createVerificationToken(data: {
    email: string
    user_id: string
    type: 'user_verification' | 'forgot_password'
  }) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    return this.prisma.verificationToken.create({
      data: {
        ...data,
        token,
        expired_at: expiredAt,
        status: 'unverified'
      }
    })
  }

  async findVerificationTokenByUserId(userId: string, token: string, type: string) {
    return this.prisma.verificationToken.findFirst({
      where: { user_id: userId, token, type, status: 'unverified' }
    })
  }
}
