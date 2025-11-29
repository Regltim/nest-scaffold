import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { knife4jSetup } from 'nestjs-knife4j';

async function bootstrap() {
  // 1. 创建应用 (指定 NestExpressApplication 以支持静态资源)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // 2. 开启跨域 (CORS) - 关键点！
  app.enableCors();

  // 3. 全局前缀
  app.setGlobalPrefix('api');

  // 4. 配置静态资源 (Uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 5. 全局验证管道
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // 6. Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('NestJS Admin API')
    .setDescription('企业级脚手架接口文档')
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        description: '输入账号密码直接登录',
        flows: {
          password: {
            // 指向我们刚才写的那个接口
            tokenUrl: '/api/auth/swagger/login',
            scopes: {},
          },
        },
      },
      'bearer', // 安全定义名称
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      // 预填充 clientId，这样你就不用每次都手写了
      oauth: {
        clientId: 'swagger_client',
        clientSecret: 'swagger_secret',
      },
    },
  });

  // 初始化 Knife4j
  knife4jSetup(app, {
    urls: [
      {
        name: '全部接口',
        url: `/doc-json`,
        swaggerVersion: '3.0',
        location: `/api-json`,
      },
    ],
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Knife4j 文档: http://localhost:3000/doc.html`);
}
bootstrap();
