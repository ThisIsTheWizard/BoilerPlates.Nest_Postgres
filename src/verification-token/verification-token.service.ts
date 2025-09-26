import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class VerificationTokenService {
  constructor(private prisma: PrismaService) {}

  async createVerificationTokenWithToken(data: {
    email: string
    token: string
    type: 'user_verification' | 'forgot_password'
    user_id: string
    expired_at: Date
  }) {
    return this.prisma.verificationToken.create({ data })
  }

  async findVerificationToken(email: string, token: string, type: 'user_verification' | 'forgot_password') {
    return this.prisma.verificationToken.findFirst({
      where: { email, token, type, status: 'unverified' }
    })
  }

  async updateVerificationToken(id: string, data: { status: 'unverified' | 'verified' | 'cancelled' }) {
    return this.prisma.verificationToken.update({
      where: { id },
      data: { status: data.status }
    })
  }

  async deleteVerificationTokens(options: Prisma.VerificationTokenDeleteManyArgs) {
    return this.prisma.verificationToken.deleteMany(options)
  }

  async cancelVerificationTokens(userId: string, type: 'user_verification' | 'forgot_password') {
    return this.prisma.verificationToken.updateMany({
      where: { user_id: userId, type, status: 'unverified' },
      data: { status: 'cancelled' }
    })
  }

  async createVerificationToken(options: Prisma.VerificationTokenCreateArgs) {
    if (!options.data.token) {
      options.data.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    return this.prisma.verificationToken.create(options)
  }

  async findVerificationTokenByUserId(userId: string, token: string, type: 'user_verification' | 'forgot_password') {
    return this.prisma.verificationToken.findFirst({
      where: { user_id: userId, token, type, status: 'unverified' }
    })
  }
}
