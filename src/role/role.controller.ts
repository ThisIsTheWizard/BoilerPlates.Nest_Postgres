import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'

import { CreateRoleDto, ManagePermissionDto, UpdateRoleDto } from '@/role/role.dto'
import { RoleService } from '@/role/role.service'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto)
  }

  @Get()
  findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id)
  }

  @Post('permissions/assign')
  assignPermission(@Body() dto: ManagePermissionDto) {
    return this.roleService.assignPermission(dto.roleId, dto.permissionId, dto.canDoAction)
  }

  @Post('permissions/revoke')
  revokePermission(@Body() dto: ManagePermissionDto) {
    return this.roleService.revokePermission(dto.roleId, dto.permissionId)
  }

  @Patch('permissions/update')
  updatePermission(@Body() dto: ManagePermissionDto) {
    return this.roleService.updatePermission(dto.roleId, dto.permissionId, dto.canDoAction!)
  }

  @Post('seed')
  seedRoles() {
    return this.roleService.seedSystemRoles()
  }
}
