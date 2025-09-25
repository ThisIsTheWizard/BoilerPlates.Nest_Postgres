import { RoleName } from '@prisma/client'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'

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

export class AssignRoleDto {
  @IsString()
  userId: string

  @IsEnum(RoleName)
  roleName: RoleName
}

export class ManagePermissionDto {
  @IsString()
  roleId: string

  @IsString()
  permissionId: string

  @IsOptional()
  @IsBoolean()
  canDoAction?: boolean
}
