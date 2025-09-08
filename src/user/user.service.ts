import { Injectable } from '@nestjs/common'

import { AuthTokenService } from '@/auth-token/auth-token.service'
import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'
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
} from '@/user/user.dto'
import { LoginResponse, MessageResponse, UserResponse } from '@/user/user.interface'
import { VerificationTokenService } from '@/verification-token/verification-token.service'

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
      throw new Error('INVALID_TOKEN')
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
      throw new Error('USER_DOES_NOT_EXIST')
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

    if (!user || !(await this.commonService.comparePassword(loginDto.password, user.password))) {
      throw new Error('Invalid credentials')
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
      throw new Error('UNAUTHORIZED')
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
      throw new Error('UNAUTHORIZED')
    }

    await this.authTokenService.revokeAuthToken(token)
    return { message: 'USER_LOGGED_OUT' }
  }

  async changeEmail(changeEmailDto: ChangeEmailDto, userId?: string): Promise<UserResponse> {
    const { email } = changeEmailDto

    if (!userId) {
      throw new Error('UNAUTHORIZED')
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
        email: user.new_email,
        new_email: null
      }
    })

    await this.verificationTokenService.updateVerificationToken(verificationToken.id, { status: 'verified' })

    const updatedUser = await this.prisma.user.findUnique({ where: { id: userId } })
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
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
    const updatedOldPasswords = [...oldPasswords.slice(-2), user.password]

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
      throw new Error('USER_DOES_NOT_EXIST')
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
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role_users: {
          include: {
            role: true
          }
        }
      }
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id }
    })
  }
}
