import { Test, TestingModule } from '@nestjs/testing'

import { CreatePermissionDto, UpdatePermissionDto } from '@/permission/permission.dto'
import { PermissionController } from '@/permission/permission.controller'
import { PermissionService } from '@/permission/permission.service'

describe('PermissionController', () => {
  let controller: PermissionController
  let permissionService: jest.Mocked<PermissionService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            seedPermissions: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<PermissionController>(PermissionController)
    permissionService = module.get<PermissionService>(PermissionService) as jest.Mocked<PermissionService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createPermissionDto: CreatePermissionDto = {
      action: 'create' as any,
      module: 'user' as any
    }

    it('success', async () => {
      const createdPermission = { id: '1', ...createPermissionDto }
      permissionService.create.mockResolvedValue(createdPermission)

      await expect(controller.create(createPermissionDto)).resolves.toEqual(createdPermission)
      expect(permissionService.create).toHaveBeenCalledWith(createPermissionDto)
    })

    it('error', async () => {
      const error = new Error('create failed')
      permissionService.create.mockRejectedValue(error)

      await expect(controller.create(createPermissionDto)).rejects.toThrow(error)
      expect(permissionService.create).toHaveBeenCalledWith(createPermissionDto)
    })
  })

  describe('findAll', () => {
    it('success', async () => {
      const permissions = [{ id: '1' }]
      permissionService.findAll.mockResolvedValue(permissions)

      await expect(controller.findAll()).resolves.toEqual(permissions)
      expect(permissionService.findAll).toHaveBeenCalledTimes(1)
    })

    it('error', async () => {
      const error = new Error('find all failed')
      permissionService.findAll.mockRejectedValue(error)

      await expect(controller.findAll()).rejects.toThrow(error)
      expect(permissionService.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findOne', () => {
    const permissionId = '1'

    it('success', async () => {
      const permission = { id: permissionId }
      permissionService.findOne.mockResolvedValue(permission)

      await expect(controller.findOne(permissionId)).resolves.toEqual(permission)
      expect(permissionService.findOne).toHaveBeenCalledWith(permissionId)
    })

    it('error', async () => {
      const error = new Error('find one failed')
      permissionService.findOne.mockRejectedValue(error)

      await expect(controller.findOne(permissionId)).rejects.toThrow(error)
      expect(permissionService.findOne).toHaveBeenCalledWith(permissionId)
    })
  })

  describe('update', () => {
    const permissionId = '1'
    const updatePermissionDto: UpdatePermissionDto = {
      action: 'update' as any
    }

    it('success', async () => {
      const updatedPermission = { id: permissionId, ...updatePermissionDto }
      permissionService.update.mockResolvedValue(updatedPermission)

      await expect(controller.update(permissionId, updatePermissionDto)).resolves.toEqual(updatedPermission)
      expect(permissionService.update).toHaveBeenCalledWith(permissionId, updatePermissionDto)
    })

    it('error', async () => {
      const error = new Error('update failed')
      permissionService.update.mockRejectedValue(error)

      await expect(controller.update(permissionId, updatePermissionDto)).rejects.toThrow(error)
      expect(permissionService.update).toHaveBeenCalledWith(permissionId, updatePermissionDto)
    })
  })

  describe('remove', () => {
    const permissionId = '1'

    it('success', async () => {
      const removedPermission = { id: permissionId }
      permissionService.remove.mockResolvedValue(removedPermission)

      await expect(controller.remove(permissionId)).resolves.toEqual(removedPermission)
      expect(permissionService.remove).toHaveBeenCalledWith(permissionId)
    })

    it('error', async () => {
      const error = new Error('remove failed')
      permissionService.remove.mockRejectedValue(error)

      await expect(controller.remove(permissionId)).rejects.toThrow(error)
      expect(permissionService.remove).toHaveBeenCalledWith(permissionId)
    })
  })

  describe('seedPermissions', () => {
    it('success', async () => {
      const seeded = [{ id: '1' }]
      permissionService.seedPermissions.mockResolvedValue(seeded)

      await expect(controller.seedPermissions()).resolves.toEqual(seeded)
      expect(permissionService.seedPermissions).toHaveBeenCalledTimes(1)
    })

    it('error', async () => {
      const error = new Error('seed failed')
      permissionService.seedPermissions.mockRejectedValue(error)

      await expect(controller.seedPermissions()).rejects.toThrow(error)
      expect(permissionService.seedPermissions).toHaveBeenCalledTimes(1)
    })
  })
})
