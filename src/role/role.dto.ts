import { IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @IsString()
  name: 'admin' | 'developer' | 'moderator' | 'user'

  @IsOptional()
  @IsString()
  created_by?: string
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: 'admin' | 'developer' | 'moderator' | 'user'
}
