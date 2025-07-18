import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './Filters/GlobalExceptionFilter';
import * as session from 'express-session';
import * as passport from 'passport';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { AuthMiddleware } from './auth/auth.middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secretKey',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000, httpOnly: true, secure: false },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const authMiddleware = app.get(AuthMiddleware);
  app.use(authMiddleware.use.bind(authMiddleware)); // Apply globally

  app.useGlobalPipes(new ValidationPipe());

  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.useGlobalFilters(new AllExceptionsFilter());
  // app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
