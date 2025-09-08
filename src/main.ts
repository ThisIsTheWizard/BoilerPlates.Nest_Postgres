import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import 'dotenv/config'
import { flatMap } from 'lodash'

import { AppModule } from '@/app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: '*' })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = flatMap(errors, 'constraints').map((msg) => msg.toUpperCase().replace(/\s+/g, '_'))
        return new BadRequestException({ messages, success: false })
      }
    })
  )
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
