import {
  ClassSerializerInterceptor,
  HttpStatus,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfig } from 'src/config';
import cookieParser from 'cookie-parser';
import { AllExceptionFilter } from 'src/infrastructure/exception/All-exception-filter';
import { winstonConfig } from 'src/infrastructure/winston/winston.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
@Injectable()
class AppService {
  async main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: winstonConfig,
    });

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // cookie yuborish uchun
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const globalPrefix = 'api/v1';
    app.setGlobalPrefix(globalPrefix);

    app.use(cookieParser());

    const httpAdapter = app.get(HttpAdapterHost);

    app.useGlobalFilters(new AllExceptionFilter());

    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    const rootPath = process.cwd();
    const uploadFolderName = appConfig.UPLOAD_FOLDER; // masalan 'uploads'
    const staticFilesPath = join(rootPath, uploadFolderName);

    // static files
    app.use(
      `/${globalPrefix}/${uploadFolderName}`, // /api/v1/uploads
      express.static(staticFilesPath),
    );

    // validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
        stopAtFirstError: true,
        disableErrorMessages: appConfig.NODE_ENV === 'production',
        exceptionFactory: (errors) => {
          const messages = errors
            .map((err) => Object.values(err.constraints || {}))
            .flat();
          return {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: messages,
            error: 'Unprocessable Entity',
          };
        },
      }),
    );

    // swagger
    const config = new DocumentBuilder()
      .setTitle('CRM School API')
      .setDescription('The CRM School API description')
      .setContact(
        'Github',
        'https://github.com/dinmuhammad05',
        'qosimovmirjalol829@gmail.com',
      )
      .setVersion('1.0')
      .addTag('my-project')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        in: 'Header',
      })
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory());

    await app.listen(appConfig.port, () => {
      console.log(`Server started on port ${appConfig.port}`);
    });
  }
}

export default new AppService();
