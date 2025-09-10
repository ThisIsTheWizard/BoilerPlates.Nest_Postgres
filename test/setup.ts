import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'

const request = require('supertest')

import { AppModule } from '../src/app/app.module'

// Don't load .env files in tests - use environment variables from Docker

let app: INestApplication
let testRequest: request.SuperTest<request.Test>
let prisma: PrismaService

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile()

  app = moduleFixture.createNestApplication()
  prisma = app.get(PrismaService)
  
  // Wait for database connection
  await prisma.$connect()
  
  await app.init()
  testRequest = request(app.getHttpServer())
}, 30000)

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (app) {
    await app.close()
  }
})

export const getTestRequest = () => testRequest
