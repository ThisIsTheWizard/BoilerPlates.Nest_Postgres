import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { RoleName } from '@prisma/client'

import { Permissions } from '@/decorators/permissions.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { AuthGuard } from '@/guards/auth.guard'
import { PermissionsGuard } from '@/guards/permissions.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { CreateUserDto, UpdateUserDto } from '@/user/user.dto'
import { UserService } from '@/user/user.service'

@UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
@Roles(RoleName.admin, RoleName.developer)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions('user.create')
  @ApiBearerAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @Permissions('user.read')
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  @Permissions('user.read')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ where: { id } })
  }

  @Patch(':id')
  @Permissions('user.update')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  @Permissions('user.delete')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}
