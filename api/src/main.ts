import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(8888);
  console.log('Application is running on: http://localhost:8888');
}
bootstrap();
