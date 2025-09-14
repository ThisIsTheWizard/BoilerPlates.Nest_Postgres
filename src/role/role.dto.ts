import { IsEnum, IsOptional, IsString } from 'class-validator'
import { RoleName } from '@prisma/client'

export class CreateRoleDto {
  @IsEnum(RoleName)
  name: RoleName

  @IsOptional()
  @IsString()
  created_by?: string
}

export class UpdateRoleDto {
  @IsOptional()
  @IsEnum(RoleName)
  name?: RoleName
}
