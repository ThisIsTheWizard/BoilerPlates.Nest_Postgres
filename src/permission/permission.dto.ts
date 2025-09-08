import { IsOptional, IsString } from 'class-validator'

export class CreatePermissionDto {
  @IsString()
  action: 'create' | 'read' | 'update' | 'delete'

  @IsString()
  module: 'permission' | 'role' | 'role_permission' | 'role_user' | 'user'

  @IsOptional()
  @IsString()
  created_by?: string
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  action?: 'create' | 'read' | 'update' | 'delete'

  @IsOptional()
  @IsString()
  module?: 'permission' | 'role' | 'role_permission' | 'role_user' | 'user'
}
