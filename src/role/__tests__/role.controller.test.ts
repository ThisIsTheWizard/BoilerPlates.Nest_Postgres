import { Test, TestingModule } from '@nestjs/testing'

import { CreateRoleDto, ManagePermissionDto, UpdateRoleDto } from '@/role/role.dto'
import { RoleController } from '@/role/role.controller'
import { RoleService } from '@/role/role.service'

describe('RoleController', () => {
  let controller: RoleController
  let roleService: jest.Mocked<RoleService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            assignPermission: jest.fn(),
            revokePermission: jest.fn(),
            updatePermission: jest.fn(),
            seedSystemRoles: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<RoleController>(RoleController)
    roleService = module.get<RoleService>(RoleService) as jest.Mocked<RoleService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createRoleDto: CreateRoleDto = {
      name: 'admin' as any
    }

    it('success', async () => {
      const createdRole = { id: '1', ...createRoleDto }
      roleService.create.mockResolvedValue(createdRole)

      await expect(controller.create(createRoleDto)).resolves.toEqual(createdRole)
      expect(roleService.create).toHaveBeenCalledWith(createRoleDto)
    })

    it('error', async () => {
      const error = new Error('create failed')
      roleService.create.mockRejectedValue(error)

      await expect(controller.create(createRoleDto)).rejects.toThrow(error)
      expect(roleService.create).toHaveBeenCalledWith(createRoleDto)
    })
  })

  describe('findAll', () => {
    it('success', async () => {
      const roles = [{ id: '1' }]
      roleService.findAll.mockResolvedValue(roles)

      await expect(controller.findAll()).resolves.toEqual(roles)
      expect(roleService.findAll).toHaveBeenCalledWith({})
    })

    it('error', async () => {
      const error = new Error('find all failed')
      roleService.findAll.mockRejectedValue(error)

      await expect(controller.findAll()).rejects.toThrow(error)
      expect(roleService.findAll).toHaveBeenCalledWith({})
    })
  })

  describe('findOne', () => {
    const roleId = '1'

    it('success', async () => {
      const role = { id: roleId }
      roleService.findOne.mockResolvedValue(role)

      await expect(controller.findOne(roleId)).resolves.toEqual(role)
      expect(roleService.findOne).toHaveBeenCalledWith({ where: { id: roleId } })
    })

    it('error', async () => {
      const error = new Error('find one failed')
      roleService.findOne.mockRejectedValue(error)

      await expect(controller.findOne(roleId)).rejects.toThrow(error)
      expect(roleService.findOne).toHaveBeenCalledWith({ where: { id: roleId } })
    })
  })

  describe('update', () => {
    const roleId = '1'
    const updateRoleDto: UpdateRoleDto = {
      name: 'moderator' as any
    }

    it('success', async () => {
      const updatedRole = { id: roleId, ...updateRoleDto }
      roleService.update.mockResolvedValue(updatedRole)

      await expect(controller.update(roleId, updateRoleDto)).resolves.toEqual(updatedRole)
      expect(roleService.update).toHaveBeenCalledWith(roleId, updateRoleDto)
    })

    it('error', async () => {
      const error = new Error('update failed')
      roleService.update.mockRejectedValue(error)

      await expect(controller.update(roleId, updateRoleDto)).rejects.toThrow(error)
      expect(roleService.update).toHaveBeenCalledWith(roleId, updateRoleDto)
    })
  })

  describe('remove', () => {
    const roleId = '1'

    it('success', async () => {
      const removedRole = { id: roleId }
      roleService.remove.mockResolvedValue(removedRole)

      await expect(controller.remove(roleId)).resolves.toEqual(removedRole)
      expect(roleService.remove).toHaveBeenCalledWith(roleId)
    })

    it('error', async () => {
      const error = new Error('remove failed')
      roleService.remove.mockRejectedValue(error)

      await expect(controller.remove(roleId)).rejects.toThrow(error)
      expect(roleService.remove).toHaveBeenCalledWith(roleId)
    })
  })

  describe('assignPermission', () => {
    const managePermissionDto: ManagePermissionDto = {
      permission_id: 'perm-1',
      role_id: 'role-1',
      can_do_the_action: true
    }

    it('success', async () => {
      const response = { id: '1', ...managePermissionDto }
      roleService.assignPermission.mockResolvedValue(response)

      await expect(controller.assignPermission(managePermissionDto)).resolves.toEqual(response)
      expect(roleService.assignPermission).toHaveBeenCalledWith(managePermissionDto)
    })

    it('error', async () => {
      const error = new Error('assign failed')
      roleService.assignPermission.mockRejectedValue(error)

      await expect(controller.assignPermission(managePermissionDto)).rejects.toThrow(error)
      expect(roleService.assignPermission).toHaveBeenCalledWith(managePermissionDto)
    })
  })

  describe('revokePermission', () => {
    const managePermissionDto: ManagePermissionDto = {
      permission_id: 'perm-1',
      role_id: 'role-1'
    }

    it('success', async () => {
      const response = { success: true }
      roleService.revokePermission.mockResolvedValue(response as any)

      await expect(controller.revokePermission(managePermissionDto)).resolves.toEqual(response)
      expect(roleService.revokePermission).toHaveBeenCalledWith(managePermissionDto)
    })

    it('error', async () => {
      const error = new Error('revoke failed')
      roleService.revokePermission.mockRejectedValue(error)

      await expect(controller.revokePermission(managePermissionDto)).rejects.toThrow(error)
      expect(roleService.revokePermission).toHaveBeenCalledWith(managePermissionDto)
    })
  })

  describe('updatePermission', () => {
    const managePermissionDto: ManagePermissionDto = {
      permission_id: 'perm-1',
      role_id: 'role-1',
      can_do_the_action: false
    }

    it('success', async () => {
      const response = { success: true }
      roleService.updatePermission.mockResolvedValue(response as any)

      await expect(controller.updatePermission(managePermissionDto)).resolves.toEqual(response)
      expect(roleService.updatePermission).toHaveBeenCalledWith(managePermissionDto)
    })

    it('error', async () => {
      const error = new Error('update permission failed')
      roleService.updatePermission.mockRejectedValue(error)

      await expect(controller.updatePermission(managePermissionDto)).rejects.toThrow(error)
      expect(roleService.updatePermission).toHaveBeenCalledWith(managePermissionDto)
    })
  })

  describe('seedRoles', () => {
    it('success', async () => {
      const roles = [{ id: '1' }]
      roleService.seedSystemRoles.mockResolvedValue(roles as any)

      await expect(controller.seedRoles()).resolves.toEqual(roles)
      expect(roleService.seedSystemRoles).toHaveBeenCalledTimes(1)
    })

    it('error', async () => {
      const error = new Error('seed failed')
      roleService.seedSystemRoles.mockRejectedValue(error)

      await expect(controller.seedRoles()).rejects.toThrow(error)
      expect(roleService.seedSystemRoles).toHaveBeenCalledTimes(1)
    })
  })
})
