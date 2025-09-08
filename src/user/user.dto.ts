import { IsPassword } from '@/decorators/password.decorator'
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  first_name?: string

  @IsOptional()
  @IsString()
  last_name?: string

  @IsPassword()
  password: string
}

export class VerifyEmailDto {
  @IsEmail()
  email: string

  @IsString()
  token: string
}

export class ResendVerificationDto {
  @IsEmail()
  email: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class RefreshTokenDto {
  @IsString()
  access_token: string

  @IsString()
  refresh_token: string
}

export class ChangeEmailDto {
  @IsEmail()
  email: string
}

export class VerifyChangeEmailDto {
  @IsString()
  token: string
}

export class SetUserEmailDto {
  @IsEmail()
  new_email: string

  @IsUUID()
  user_id: string
}

export class ChangePasswordDto {
  @IsPassword()
  new_password: string

  @IsString()
  old_password: string
}

export class SetUserPasswordDto {
  @IsPassword()
  password: string

  @IsUUID()
  user_id: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string
}

export class VerifyForgotPasswordDto {
  @IsEmail()
  email: string

  @IsPassword()
  password: string

  @IsString()
  token: string
}

export class VerifyForgotPasswordCodeDto {
  @IsEmail()
  email: string

  @IsString()
  token: string
}

export class VerifyUserPasswordDto {
  @IsString()
  password: string
}

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  first_name?: string

  @IsOptional()
  @IsString()
  last_name?: string

  @IsOptional()
  @IsString()
  new_email?: string

  @IsPassword()
  password: string

  @IsOptional()
  @IsString()
  phone_number?: string

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'invited' | 'unverified'
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  first_name?: string

  @IsOptional()
  @IsString()
  last_name?: string

  @IsOptional()
  @IsString()
  new_email?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsString()
  phone_number?: string

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'invited' | 'unverified'
}
