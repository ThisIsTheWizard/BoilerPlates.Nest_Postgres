import { Test, TestingModule } from '@nestjs/testing'

import { AssignRoleDto, RevokeRoleDto } from '@/auth/auth.dto'
import { AuthController } from '@/auth/auth.controller'
import { AuthService } from '@/auth/auth.service'
import {
  ChangeEmailDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerificationDto,
  SetUserEmailDto,
  SetUserPasswordDto,
  VerifyChangeEmailDto,
  VerifyEmailDto,
  VerifyForgotPasswordCodeDto,
  VerifyForgotPasswordDto,
  VerifyUserPasswordDto
} from '@/user/user.dto'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            verifyUserEmail: jest.fn(),
            resendVerificationEmail: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            changeEmail: jest.fn(),
            cancelChangeEmail: jest.fn(),
            verifyChangeEmail: jest.fn(),
            setUserEmail: jest.fn(),
            changePassword: jest.fn(),
            setUserPassword: jest.fn(),
            forgotPassword: jest.fn(),
            retryForgotPassword: jest.fn(),
            verifyForgotPassword: jest.fn(),
            verifyForgotPasswordCode: jest.fn(),
            verifyUserPassword: jest.fn(),
            getAuthUser: jest.fn(),
            assignRole: jest.fn(),
            revokeRole: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'user@example.com',
      password: 'Password123!',
      first_name: 'Test',
      last_name: 'User'
    }

    it('success', async () => {
      const response = { id: '1' }
      authService.register.mockResolvedValue(response as any)

      await expect(controller.register(registerDto)).resolves.toEqual(response)
      expect(authService.register).toHaveBeenCalledWith(registerDto)
    })

    it('error', async () => {
      const error = new Error('register failed')
      authService.register.mockRejectedValue(error)

      await expect(controller.register(registerDto)).rejects.toThrow(error)
      expect(authService.register).toHaveBeenCalledWith(registerDto)
    })
  })

  describe('verifyUserEmail', () => {
    const verifyEmailDto: VerifyEmailDto = {
      email: 'user@example.com',
      token: 'token'
    }

    it('success', async () => {
      const response = { id: '1' }
      authService.verifyUserEmail.mockResolvedValue(response as any)

      await expect(controller.verifyUserEmail(verifyEmailDto)).resolves.toEqual(response)
      expect(authService.verifyUserEmail).toHaveBeenCalledWith(verifyEmailDto)
    })

    it('error', async () => {
      const error = new Error('verify failed')
      authService.verifyUserEmail.mockRejectedValue(error)

      await expect(controller.verifyUserEmail(verifyEmailDto)).rejects.toThrow(error)
      expect(authService.verifyUserEmail).toHaveBeenCalledWith(verifyEmailDto)
    })
  })

  describe('resendVerificationEmail', () => {
    const resendVerificationDto: ResendVerificationDto = {
      email: 'user@example.com'
    }

    it('success', async () => {
      const response = { success: true }
      authService.resendVerificationEmail.mockResolvedValue(response as any)

      await expect(controller.resendVerificationEmail(resendVerificationDto)).resolves.toEqual(response)
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(resendVerificationDto)
    })

    it('error', async () => {
      const error = new Error('resend failed')
      authService.resendVerificationEmail.mockRejectedValue(error)

      await expect(controller.resendVerificationEmail(resendVerificationDto)).rejects.toThrow(error)
      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(resendVerificationDto)
    })
  })

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'Password123!'
    }

    it('success', async () => {
      const response = { access_token: 'access', refresh_token: 'refresh' }
      authService.login.mockResolvedValue(response as any)

      await expect(controller.login(loginDto)).resolves.toEqual(response)
      expect(authService.login).toHaveBeenCalledWith(loginDto)
    })

    it('error', async () => {
      const error = new Error('login failed')
      authService.login.mockRejectedValue(error)

      await expect(controller.login(loginDto)).rejects.toThrow(error)
      expect(authService.login).toHaveBeenCalledWith(loginDto)
    })
  })

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      access_token: 'access',
      refresh_token: 'refresh'
    }

    it('success', async () => {
      const response = { access_token: 'new-access', refresh_token: 'new-refresh' }
      authService.refreshToken.mockResolvedValue(response as any)

      await expect(controller.refreshToken(refreshTokenDto)).resolves.toEqual(response)
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto)
    })

    it('error', async () => {
      const error = new Error('refresh failed')
      authService.refreshToken.mockRejectedValue(error)

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(error)
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto)
    })
  })

  describe('logout', () => {
    const token = 'Bearer access-token'

    it('success', async () => {
      const response = { success: true }
      authService.logout.mockResolvedValue(response as any)

      await expect(controller.logout(token)).resolves.toEqual(response)
      expect(authService.logout).toHaveBeenCalledWith('access-token')
    })

    it('error', async () => {
      const error = new Error('logout failed')
      authService.logout.mockRejectedValue(error)

      await expect(controller.logout(token)).rejects.toThrow(error)
      expect(authService.logout).toHaveBeenCalledWith('access-token')
    })
  })

  describe('changeEmail', () => {
    const changeEmailDto: ChangeEmailDto = {
      email: 'new@example.com'
    }
    const userId = 'user-1'

    it('success', async () => {
      const response = { success: true }
      authService.changeEmail.mockResolvedValue(response as any)

      await expect(controller.changeEmail(changeEmailDto, userId)).resolves.toEqual(response)
      expect(authService.changeEmail).toHaveBeenCalledWith(changeEmailDto.email, userId)
    })

    it('error', async () => {
      const error = new Error('change email failed')
      authService.changeEmail.mockRejectedValue(error)

      await expect(controller.changeEmail(changeEmailDto, userId)).rejects.toThrow(error)
      expect(authService.changeEmail).toHaveBeenCalledWith(changeEmailDto.email, userId)
    })
  })

  describe('cancelChangeEmail', () => {
    const changeEmailDto: ChangeEmailDto = {
      email: 'new@example.com'
    }

    it('success', async () => {
      const response = { success: true }
      authService.cancelChangeEmail.mockResolvedValue(response as any)

      await expect(controller.cancelChangeEmail(changeEmailDto)).resolves.toEqual(response)
      expect(authService.cancelChangeEmail).toHaveBeenCalledWith(changeEmailDto)
    })

    it('error', async () => {
      const error = new Error('cancel failed')
      authService.cancelChangeEmail.mockRejectedValue(error)

      await expect(controller.cancelChangeEmail(changeEmailDto)).rejects.toThrow(error)
      expect(authService.cancelChangeEmail).toHaveBeenCalledWith(changeEmailDto)
    })
  })

  describe('verifyChangeEmail', () => {
    const verifyChangeEmailDto: VerifyChangeEmailDto = {
      token: 'token'
    }
    const userId = 'user-1'

    it('success', async () => {
      const response = { success: true }
      authService.verifyChangeEmail.mockResolvedValue(response as any)

      await expect(controller.verifyChangeEmail(verifyChangeEmailDto, userId)).resolves.toEqual(response)
      expect(authService.verifyChangeEmail).toHaveBeenCalledWith(verifyChangeEmailDto, userId)
    })

    it('error', async () => {
      const error = new Error('verify change failed')
      authService.verifyChangeEmail.mockRejectedValue(error)

      await expect(controller.verifyChangeEmail(verifyChangeEmailDto, userId)).rejects.toThrow(error)
      expect(authService.verifyChangeEmail).toHaveBeenCalledWith(verifyChangeEmailDto, userId)
    })
  })

  describe('setUserEmail', () => {
    const setUserEmailDto: SetUserEmailDto = {
      new_email: 'new@example.com',
      user_id: 'user-1'
    }

    it('success', async () => {
      const response = { success: true }
      authService.setUserEmail.mockResolvedValue(response as any)

      await expect(controller.setUserEmail(setUserEmailDto)).resolves.toEqual(response)
      expect(authService.setUserEmail).toHaveBeenCalledWith(setUserEmailDto)
    })

    it('error', async () => {
      const error = new Error('set email failed')
      authService.setUserEmail.mockRejectedValue(error)

      await expect(controller.setUserEmail(setUserEmailDto)).rejects.toThrow(error)
      expect(authService.setUserEmail).toHaveBeenCalledWith(setUserEmailDto)
    })
  })

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      new_password: 'NewPassword123!',
      old_password: 'OldPassword123!'
    }
    const userId = 'user-1'

    it('success', async () => {
      const response = { success: true }
      authService.changePassword.mockResolvedValue(response as any)

      await expect(controller.changePassword(changePasswordDto, userId)).resolves.toEqual(response)
      expect(authService.changePassword).toHaveBeenCalledWith(changePasswordDto, userId)
    })

    it('error', async () => {
      const error = new Error('change password failed')
      authService.changePassword.mockRejectedValue(error)

      await expect(controller.changePassword(changePasswordDto, userId)).rejects.toThrow(error)
      expect(authService.changePassword).toHaveBeenCalledWith(changePasswordDto, userId)
    })
  })

  describe('setUserPassword', () => {
    const setUserPasswordDto: SetUserPasswordDto = {
      password: 'Password123!',
      user_id: 'user-1'
    }

    it('success', async () => {
      const response = { success: true }
      authService.setUserPassword.mockResolvedValue(response as any)

      await expect(controller.setUserPassword(setUserPasswordDto)).resolves.toEqual(response)
      expect(authService.setUserPassword).toHaveBeenCalledWith(setUserPasswordDto)
    })

    it('error', async () => {
      const error = new Error('set password failed')
      authService.setUserPassword.mockRejectedValue(error)

      await expect(controller.setUserPassword(setUserPasswordDto)).rejects.toThrow(error)
      expect(authService.setUserPassword).toHaveBeenCalledWith(setUserPasswordDto)
    })
  })

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'user@example.com'
    }

    it('success', async () => {
      const response = { success: true }
      authService.forgotPassword.mockResolvedValue(response as any)

      await expect(controller.forgotPassword(forgotPasswordDto)).resolves.toEqual(response)
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto)
    })

    it('error', async () => {
      const error = new Error('forgot password failed')
      authService.forgotPassword.mockRejectedValue(error)

      await expect(controller.forgotPassword(forgotPasswordDto)).rejects.toThrow(error)
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto)
    })
  })

  describe('retryForgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'user@example.com'
    }

    it('success', async () => {
      const response = { success: true }
      authService.retryForgotPassword.mockResolvedValue(response as any)

      await expect(controller.retryForgotPassword(forgotPasswordDto)).resolves.toEqual(response)
      expect(authService.retryForgotPassword).toHaveBeenCalledWith(forgotPasswordDto)
    })

    it('error', async () => {
      const error = new Error('retry failed')
      authService.retryForgotPassword.mockRejectedValue(error)

      await expect(controller.retryForgotPassword(forgotPasswordDto)).rejects.toThrow(error)
      expect(authService.retryForgotPassword).toHaveBeenCalledWith(forgotPasswordDto)
    })
  })

  describe('verifyForgotPassword', () => {
    const verifyForgotPasswordDto: VerifyForgotPasswordDto = {
      email: 'user@example.com',
      password: 'Password123!',
      token: 'token'
    }

    it('success', async () => {
      const response = { success: true }
      authService.verifyForgotPassword.mockResolvedValue(response as any)

      await expect(controller.verifyForgotPassword(verifyForgotPasswordDto)).resolves.toEqual(response)
      expect(authService.verifyForgotPassword).toHaveBeenCalledWith(verifyForgotPasswordDto)
    })

    it('error', async () => {
      const error = new Error('verify forgot failed')
      authService.verifyForgotPassword.mockRejectedValue(error)

      await expect(controller.verifyForgotPassword(verifyForgotPasswordDto)).rejects.toThrow(error)
      expect(authService.verifyForgotPassword).toHaveBeenCalledWith(verifyForgotPasswordDto)
    })
  })

  describe('verifyForgotPasswordCode', () => {
    const verifyForgotPasswordCodeDto: VerifyForgotPasswordCodeDto = {
      email: 'user@example.com',
      token: 'token'
    }

    it('success', async () => {
      const response = { success: true }
      authService.verifyForgotPasswordCode.mockResolvedValue(response as any)

      await expect(controller.verifyForgotPasswordCode(verifyForgotPasswordCodeDto)).resolves.toEqual(response)
      expect(authService.verifyForgotPasswordCode).toHaveBeenCalledWith(verifyForgotPasswordCodeDto)
    })

    it('error', async () => {
      const error = new Error('verify code failed')
      authService.verifyForgotPasswordCode.mockRejectedValue(error)

      await expect(controller.verifyForgotPasswordCode(verifyForgotPasswordCodeDto)).rejects.toThrow(error)
      expect(authService.verifyForgotPasswordCode).toHaveBeenCalledWith(verifyForgotPasswordCodeDto)
    })
  })

  describe('verifyUserPassword', () => {
    const verifyUserPasswordDto: VerifyUserPasswordDto = {
      password: 'Password123!'
    }
    const userId = 'user-1'

    it('success', async () => {
      const response = { success: true }
      authService.verifyUserPassword.mockResolvedValue(response as any)

      await expect(controller.verifyUserPassword(verifyUserPasswordDto, userId)).resolves.toEqual(response)
      expect(authService.verifyUserPassword).toHaveBeenCalledWith(verifyUserPasswordDto, userId)
    })

    it('error', async () => {
      const error = new Error('verify user password failed')
      authService.verifyUserPassword.mockRejectedValue(error)

      await expect(controller.verifyUserPassword(verifyUserPasswordDto, userId)).rejects.toThrow(error)
      expect(authService.verifyUserPassword).toHaveBeenCalledWith(verifyUserPasswordDto, userId)
    })
  })

  describe('getAuthUser', () => {
    const userId = 'user-1'

    it('success', async () => {
      const response = { id: userId }
      authService.getAuthUser.mockResolvedValue(response as any)

      await expect(controller.getAuthUser(userId)).resolves.toEqual(response)
      expect(authService.getAuthUser).toHaveBeenCalledWith(userId)
    })

    it('error', async () => {
      const error = new Error('get auth user failed')
      authService.getAuthUser.mockRejectedValue(error)

      await expect(controller.getAuthUser(userId)).rejects.toThrow(error)
      expect(authService.getAuthUser).toHaveBeenCalledWith(userId)
    })
  })

  describe('assignRole', () => {
    const assignRoleDto: AssignRoleDto = {
      user_id: 'user-1',
      role_id: 'role-1'
    }

    it('success', async () => {
      const response = { success: true }
      authService.assignRole.mockResolvedValue(response as any)

      await expect(controller.assignRole(assignRoleDto)).resolves.toEqual(response)
      expect(authService.assignRole).toHaveBeenCalledWith(assignRoleDto)
    })

    it('error', async () => {
      const error = new Error('assign role failed')
      authService.assignRole.mockRejectedValue(error)

      await expect(controller.assignRole(assignRoleDto)).rejects.toThrow(error)
      expect(authService.assignRole).toHaveBeenCalledWith(assignRoleDto)
    })
  })

  describe('revokeRole', () => {
    const revokeRoleDto: RevokeRoleDto = {
      user_id: 'user-1',
      role_id: 'role-1'
    }

    it('success', async () => {
      const response = { success: true }
      authService.revokeRole.mockResolvedValue(response as any)

      await expect(controller.revokeRole(revokeRoleDto)).resolves.toEqual(response)
      expect(authService.revokeRole).toHaveBeenCalledWith(revokeRoleDto)
    })

    it('error', async () => {
      const error = new Error('revoke role failed')
      authService.revokeRole.mockRejectedValue(error)

      await expect(controller.revokeRole(revokeRoleDto)).rejects.toThrow(error)
      expect(authService.revokeRole).toHaveBeenCalledWith(revokeRoleDto)
    })
  })
})
