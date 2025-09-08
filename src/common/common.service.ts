import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { isEmail, isStrongPassword } from 'validator'

@Injectable()
export class CommonService {
  constructor(private configService: ConfigService) {}

  generateJWTToken(payload: object, isRefreshToken = false): string {
    const expiresIn = isRefreshToken
      ? this.configService.get<string>('REFRESH_TOKEN_EXPIRY', '7d')
      : this.configService.get<string>('ACCESS_TOKEN_EXPIRY', '1d')

    return jwt.sign(payload, this.configService.get<string>('JWT_SECRET'), {
      expiresIn,
      issuer: this.configService.get<string>('JWT_ISSUER')
    })
  }

  verifyJWTToken(token: string): jwt.JwtPayload | string {
    return jwt.verify(token, this.configService.get<string>('JWT_SECRET'))
  }

  decodeJWTToken(token: string): jwt.JwtPayload | string | null {
    return jwt.decode(token)
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.configService.get<number>('BCRYPT_ROUNDS', 10))
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  validateEmail(email: string): boolean {
    return isEmail(email)
  }

  validatePassword(password: string): boolean {
    return isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
  }
}
