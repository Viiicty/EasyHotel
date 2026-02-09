import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { JwtAuthGuard } from './common/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  //不需要了
  await app.listen(8888);
  console.log('Application is running on: http://localhost:8888');
}
bootstrap();
