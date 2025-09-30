import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from '@/app/app.controller'
import { AppService } from '@/app/app.service'

describe('AppController', () => {
  let controller: AppController
  let appService: jest.Mocked<AppService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getWelcomeMessage: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<AppController>(AppController)
    appService = module.get<AppService>(AppService) as jest.Mocked<AppService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getWelcomeMessage', () => {
    it('success', () => {
      const response = { message: 'hello', success: true }
      appService.getWelcomeMessage.mockReturnValue(response)

      const result = controller.getWelcomeMessage()

      expect(result).toEqual(response)
      expect(appService.getWelcomeMessage).toHaveBeenCalledTimes(1)
    })

    it('error', () => {
      const error = new Error('unexpected')
      appService.getWelcomeMessage.mockImplementation(() => {
        throw error
      })

      expect(() => controller.getWelcomeMessage()).toThrow(error)
      expect(appService.getWelcomeMessage).toHaveBeenCalledTimes(1)
    })
  })
})
