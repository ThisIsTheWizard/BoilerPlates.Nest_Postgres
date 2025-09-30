import { Test, TestingModule } from '@nestjs/testing'

import { CreateUserDto, UpdateUserDto } from '@/user/user.dto'
import { UserController } from '@/user/user.controller'
import { UserService } from '@/user/user.service'

describe('UserController', () => {
  let controller: UserController
  let userService: jest.Mocked<UserService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<UserController>(UserController)
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'user@example.com',
      password: 'Password123!',
      first_name: 'Test',
      last_name: 'User'
    }

    it('success', async () => {
      const createdUser = { id: '1', ...createUserDto }
      userService.create.mockResolvedValue(createdUser)

      await expect(controller.create(createUserDto)).resolves.toEqual(createdUser)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
    })

    it('error', async () => {
      const error = new Error('create failed')
      userService.create.mockRejectedValue(error)

      await expect(controller.create(createUserDto)).rejects.toThrow(error)
      expect(userService.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('findAll', () => {
    it('success', async () => {
      const users = [{ id: '1' }]
      userService.findAll.mockResolvedValue(users)

      await expect(controller.findAll()).resolves.toEqual(users)
      expect(userService.findAll).toHaveBeenCalledTimes(1)
    })

    it('error', async () => {
      const error = new Error('find all failed')
      userService.findAll.mockRejectedValue(error)

      await expect(controller.findAll()).rejects.toThrow(error)
      expect(userService.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findOne', () => {
    const userId = '1'

    it('success', async () => {
      const user = { id: userId }
      userService.findOne.mockResolvedValue(user)

      await expect(controller.findOne(userId)).resolves.toEqual(user)
      expect(userService.findOne).toHaveBeenCalledWith({ where: { id: userId } })
    })

    it('error', async () => {
      const error = new Error('find one failed')
      userService.findOne.mockRejectedValue(error)

      await expect(controller.findOne(userId)).rejects.toThrow(error)
      expect(userService.findOne).toHaveBeenCalledWith({ where: { id: userId } })
    })
  })

  describe('update', () => {
    const userId = '1'
    const updateUserDto: UpdateUserDto = {
      first_name: 'Updated'
    }

    it('success', async () => {
      const updatedUser = { id: userId, ...updateUserDto }
      userService.update.mockResolvedValue(updatedUser)

      await expect(controller.update(userId, updateUserDto)).resolves.toEqual(updatedUser)
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto)
    })

    it('error', async () => {
      const error = new Error('update failed')
      userService.update.mockRejectedValue(error)

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(error)
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto)
    })
  })

  describe('remove', () => {
    const userId = '1'

    it('success', async () => {
      const deletedUser = { id: userId }
      userService.remove.mockResolvedValue(deletedUser)

      await expect(controller.remove(userId)).resolves.toEqual(deletedUser)
      expect(userService.remove).toHaveBeenCalledWith(userId)
    })

    it('error', async () => {
      const error = new Error('remove failed')
      userService.remove.mockRejectedValue(error)

      await expect(controller.remove(userId)).rejects.toThrow(error)
      expect(userService.remove).toHaveBeenCalledWith(userId)
    })
  })
})
