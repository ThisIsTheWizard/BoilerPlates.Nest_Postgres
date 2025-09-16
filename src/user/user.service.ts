import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'

import { AuthTokenService } from '@/auth-token/auth-token.service'
import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'
import { VerificationTokenService } from '@/verification-token/verification-token.service'
import {
  ChangeEmailDto,
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerificationDto,
  SetUserEmailDto,
  SetUserPasswordDto,
  UpdateUserDto,
  VerifyChangeEmailDto,
  VerifyEmailDto,
  VerifyForgotPasswordCodeDto,
  VerifyForgotPasswordDto,
  VerifyUserPasswordDto
} from './user.dto'
import { LoginResponse, MessageResponse, UserResponse } from './user.interface'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private commonService: CommonService,
    private authTokenService: AuthTokenService,
    private verificationTokenService: VerificationTokenService
  ) {}

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const hashedPassword = await this.commonService.hashPassword(registerDto.password)

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword
      }
    })

    // Assign default user role
    const userRole = await this.prisma.role.findUnique({ where: { name: 'user' } })
    if (userRole) {
      await this.prisma.roleUser.create({
        data: {
          user_id: user.id,
          role_id: userRole.id
        }
      })
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    }
  }

  async verifyUserEmail(verifyEmailDto: VerifyEmailDto): Promise<UserResponse> {
    const { email, token } = verifyEmailDto

    const verificationToken = await this.verificationTokenService.findVerificationToken(
      email,
      token,
      'user_verification'
    )

    if (!verificationToken) {
      throw new BadRequestException('INVALID_TOKEN')
    }

    const user = await this.prisma.user.update({
      where: { email },
      data: { status: 'active' }
    })

    await this.verificationTokenService.updateVerificationToken(verificationToken.id, { status: 'verified' })

    return { id: user.id, email: user.email, status: user.status }
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto): Promise<MessageResponse> {
    const { email } = resendVerificationDto

    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new NotFoundException('USER_DOES_NOT_EXIST')
    }

    return { message: 'VERIFICATION_EMAIL_SENT' }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role_users: {
          include: { role: true }
        }
      }
    })

    if (!user || !user.password || !(await this.commonService.comparePassword(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const token = this.commonService.generateJWTToken({
      user_id: user.id,
      email: user.email
    })

    return { user, token }
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto
  ): Promise<MessageResponse & { access_token?: string; refresh_token?: string }> {
    const { access_token, refresh_token } = refreshTokenDto

    const decoded = this.commonService.decodeJWTToken(access_token) as { user_id: string }
    const { user_id } = decoded || {}
    if (!user_id) {
      throw new UnauthorizedException('INVALID_TOKEN')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
      include: {
        role_users: {
          include: { role: true }
        }
      }
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    // Validate refresh token and generate new tokens
    const isValidRefreshToken = await this.authTokenService.validateRefreshToken(refresh_token, user_id)
    if (!isValidRefreshToken) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // Generate new access and refresh tokens
    const newAccessToken = this.commonService.generateJWTToken({
      user_id: user.id,
      email: user.email,
      roles: user.role_users.map((ru) => ru.role.name)
    })

    const newRefreshToken = this.commonService.generateJWTToken(
      {
        user_id: user.id,
        email: user.email
      },
      true
    )

    // Update refresh token in database
    await this.authTokenService.updateRefreshToken(refresh_token, newRefreshToken)

    return {
      message: 'TOKENS_REFRESHED',
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    }
  }

  async getMe(userId?: string): Promise<UserResponse> {
    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role_users: {
          include: { role: true }
        }
      }
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    }
  }

  async logout(token?: string): Promise<MessageResponse> {
    if (!token) {
      throw new UnauthorizedException('UNAUTHORIZED')
    }

    await this.authTokenService.revokeAuthToken(token)
    return { message: 'USER_LOGGED_OUT' }
  }

  async changeEmail(changeEmailDto: ChangeEmailDto, userId?: string): Promise<UserResponse> {
    const { email } = changeEmailDto

    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED')
    }

    if (!this.commonService.validateEmail(email)) {
      throw new Error('EMAIL_IS_INVALID')
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { new_email: email }] }
    })

    if (existingUser) {
      throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('USER_DOES_NOT_EXIST')
    }
    if (user.status !== 'active') {
      throw new Error(`USER_IS_${user.status.toUpperCase()}`)
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { new_email: email }
    })

    // Delete existing verification tokens and create new one
    await this.verificationTokenService.deleteVerificationTokens(userId, email, 'user_verification')
    await this.verificationTokenService.createVerificationToken({
      email,
      user_id: userId,
      type: 'user_verification'
    })

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    }
  }

  async cancelChangeEmail(changeEmailDto: ChangeEmailDto): Promise<MessageResponse> {
    const { email } = changeEmailDto

    const user = await this.prisma.user.findFirst({
      where: { new_email: email }
    })
    if (!user) {
      throw new Error('NO_CHANGE_EMAIL_REQUEST_IS_FOUND')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { new_email: null }
    })

    return { message: 'EMAIL_CHANGE_CANCELLED' }
  }

  async verifyChangeEmail(verifyChangeEmailDto: VerifyChangeEmailDto, userId?: string): Promise<UserResponse> {
    const { token } = verifyChangeEmailDto

    if (!userId) {
      throw new Error('UNAUTHORIZED')
    }

    // Find verification token by user_id and token
    const verificationToken = await this.verificationTokenService.findVerificationTokenByUserId(
      userId,
      token,
      'user_verification'
    )

    if (!verificationToken) {
      throw new Error('INVALID_TOKEN')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('USER_DOES_NOT_EXIST')
    }
    if (user.status !== 'active') {
      throw new Error(`USER_IS_${user.status.toUpperCase()}`)
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: user.new_email!,
        new_email: null
      }
    })

    await this.verificationTokenService.updateVerificationToken(verificationToken.id, { status: 'verified' })

    const updatedUser = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!updatedUser) {
      throw new Error('USER_NOT_FOUND')
    }
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name || undefined,
      last_name: updatedUser.last_name || undefined,
      status: updatedUser.status
    }
  }

  async setUserEmail(setUserEmailDto: SetUserEmailDto): Promise<UserResponse> {
    const { new_email, user_id } = setUserEmailDto

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: new_email }, { new_email }] }
    })

    if (existingUser) {
      throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    }

    const user = await this.prisma.user.update({
      where: { id: user_id },
      data: { email: new_email, new_email: null }
    })

    return { id: user.id, email: user.email }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId?: string): Promise<UserResponse> {
    const { new_password, old_password } = changePasswordDto

    if (!userId) {
      throw new Error('UNAUTHORIZED')
    }

    if (new_password === old_password) {
      throw new Error('NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('USER_DOES_NOT_EXIST')
    }
    if (user.status !== 'active') {
      throw new Error(`USER_IS_${user.status.toUpperCase()}`)
    }

    if (!user.password) {
      throw new Error('USER_PASSWORD_NOT_SET')
    }
    const isOldPasswordCorrect = await this.commonService.comparePassword(old_password, user.password)
    if (!isOldPasswordCorrect) {
      throw new Error('OLD_PASSWORD_IS_INCORRECT')
    }

    // Check if new password was used before
    const oldPasswords = user.old_passwords || []
    for (const oldPass of oldPasswords) {
      if (await this.commonService.comparePassword(new_password, oldPass)) {
        throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
      }
    }

    const hashedNewPassword = await this.commonService.hashPassword(new_password)
    const updatedOldPasswords = [...(oldPasswords.filter((p) => p !== null) as string[]).slice(-2), user.password!]

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        old_passwords: updatedOldPasswords
      }
    })

    await this.authTokenService.deleteAuthTokens(userId)

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    }
  }

  async setUserPassword(setUserPasswordDto: SetUserPasswordDto): Promise<{ id: string; message: string }> {
    const { password, user_id } = setUserPasswordDto

    const hashedPassword = await this.commonService.hashPassword(password)
    const user = await this.prisma.user.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    })

    return { id: user.id, message: 'PASSWORD_SET' }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponse> {
    const { email } = forgotPasswordDto

    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new NotFoundException('USER_DOES_NOT_EXIST')
    }

    return { message: 'FORGOT_PASSWORD_EMAIL_SENT' }
  }

  async retryForgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponse> {
    const { email } = forgotPasswordDto

    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('USER_DOES_NOT_EXIST')
    }

    return { message: 'FORGOT_PASSWORD_EMAIL_RESENT' }
  }

  async verifyForgotPassword(verifyForgotPasswordDto: VerifyForgotPasswordDto): Promise<UserResponse> {
    const { email, password, token } = verifyForgotPasswordDto

    const verificationToken = await this.verificationTokenService.findVerificationToken(email, token, 'forgot_password')

    if (!verificationToken) {
      throw new Error('INVALID_TOKEN')
    }

    const hashedPassword = await this.commonService.hashPassword(password)
    const user = await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    await this.authTokenService.deleteAuthTokens(user.id)

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status
    }
  }

  async verifyForgotPasswordCode(verifyForgotPasswordCodeDto: VerifyForgotPasswordCodeDto): Promise<MessageResponse> {
    const { email, token } = verifyForgotPasswordCodeDto

    const verificationToken = await this.verificationTokenService.findVerificationToken(email, token, 'forgot_password')

    if (!verificationToken) {
      throw new Error('OTP_IS_NOT_VALID')
    }

    return { message: 'OTP_IS_VALID', success: true }
  }

  async verifyUserPassword(verifyUserPasswordDto: VerifyUserPasswordDto, userId?: string): Promise<MessageResponse> {
    const { password } = verifyUserPasswordDto

    if (!userId) {
      throw new Error('UNAUTHORIZED')
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error('USER_IS_NOT_FOUND')
    }
    if (user.status !== 'active') {
      throw new Error(`USER_IS_${user.status.toUpperCase()}`)
    }

    if (!user.password) {
      throw new Error('USER_PASSWORD_NOT_SET')
    }
    const isPasswordCorrect = await this.commonService.comparePassword(password, user.password)

    return {
      message: isPasswordCorrect ? 'PASSWORD_IS_CORRECT' : 'PASSWORD_IS_INCORRECT',
      success: isPasswordCorrect
    }
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.commonService.hashPassword(createUserDto.password)
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword
      }
    })
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role_users: {
          include: {
            role: true
          }
        }
      }
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role_users: {
          include: {
            role: true
          }
        }
      }
    })
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return this.prisma.user.update({
        where: { id },
        data: updateUserDto
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }

  async seedTestUsers() {
    const hashedPassword = await this.commonService.hashPassword('password')
    return this.prisma.user.createMany({
      data: [
        {
          email: 'test-1@test.com',
          first_name: 'Test',
          last_name: 'User 1',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-2@test.com',
          first_name: 'Test',
          last_name: 'User 2',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-3@test.com',
          first_name: 'Test',
          last_name: 'User 3',
          password: hashedPassword,
          status: 'active'
        }
      ]
    })
  }

  async remove(id: string) {
    try {
      return this.prisma.user.delete({
        where: { id }
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }

  async assignRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName as any } })
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    return this.prisma.roleUser.upsert({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: role.id
        }
      },
      update: {},
      create: {
        user_id: userId,
        role_id: role.id
      }
    })
  }

  async revokeRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName as any } })
    if (!role) {
      throw new Error('ROLE_NOT_FOUND')
    }

    return this.prisma.roleUser.delete({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: role.id
        }
      }
    })
  }
}
