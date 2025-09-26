import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import { User } from '@/decorators/user.decorator'
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
import { UserService } from '@/user/user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto)
  }

  @Post('verify-user-email')
  verifyUserEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.userService.verifyUserEmail(verifyEmailDto)
  }

  @Post('resend-verification-email')
  resendVerificationEmail(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.userService.resendVerificationEmail(resendVerificationDto)
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto)
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto)
  }

  @Get('me')
  @ApiBearerAuth()
  getMe(@User('user_id') user_id: string) {
    return this.userService.getMe(user_id)
  }

  @Post('logout')
  @ApiBearerAuth()
  logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '')
    return this.userService.logout(token)
  }

  @Post('change-email')
  @ApiBearerAuth()
  changeEmail(@Body() changeEmailDto: ChangeEmailDto, @User('user_id') userId: string) {
    return this.userService.changeEmail(changeEmailDto.email, userId)
  }

  @Post('cancel-change-email')
  cancelChangeEmail(@Body() changeEmailDto: ChangeEmailDto) {
    return this.userService.cancelChangeEmail(changeEmailDto)
  }

  @Post('verify-change-email')
  @ApiBearerAuth()
  verifyChangeEmail(@Body() verifyChangeEmailDto: VerifyChangeEmailDto, @User('user_id') userId: string) {
    return this.userService.verifyChangeEmail(verifyChangeEmailDto, userId)
  }

  @Post('set-user-email')
  setUserEmail(@Body() setUserEmailDto: SetUserEmailDto) {
    return this.userService.setUserEmail(setUserEmailDto)
  }

  @Post('change-password')
  @ApiBearerAuth()
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @User('user_id') userId: string) {
    return this.userService.changePassword(changePasswordDto, userId)
  }

  @Post('set-user-password')
  setUserPassword(@Body() setUserPasswordDto: SetUserPasswordDto) {
    return this.userService.setUserPassword(setUserPasswordDto)
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPasswordDto)
  }

  @Post('retry-forgot-password')
  retryForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.retryForgotPassword(forgotPasswordDto)
  }

  @Post('verify-forgot-password')
  verifyForgotPassword(@Body() verifyForgotPasswordDto: VerifyForgotPasswordDto) {
    return this.userService.verifyForgotPassword(verifyForgotPasswordDto)
  }

  @Post('verify-forgot-password-code')
  verifyForgotPasswordCode(@Body() verifyForgotPasswordCodeDto: VerifyForgotPasswordCodeDto) {
    return this.userService.verifyForgotPasswordCode(verifyForgotPasswordCodeDto)
  }

  @Post('verify-user-password')
  @ApiBearerAuth()
  verifyUserPassword(@Body() verifyUserPasswordDto: VerifyUserPasswordDto, @User('user_id') userId: string) {
    return this.userService.verifyUserPassword(verifyUserPasswordDto, userId)
  }

  @Post()
  @ApiBearerAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ where: { id } })
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }

  @Post(':id/roles/:roleName')
  @ApiBearerAuth()
  assignRole(@Param('id') userId: string, @Param('roleName') roleName: string) {
    return this.userService.assignRole(userId, roleName)
  }

  @Delete(':id/roles/:roleName')
  @ApiBearerAuth()
  revokeRole(@Param('id') userId: string, @Param('roleName') roleName: string) {
    return this.userService.revokeRole(userId, roleName)
  }
}
