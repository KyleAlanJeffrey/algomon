import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
async function bootstrap() {
  console.log('Starting server...');
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  let app;
  if (process.env.NODE_ENV?.replace(' ', '') != 'dev') {
    const keyFile = fs.readFileSync(
      '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/privkey.pem',
    );
    const certFile = fs.readFileSync(
      '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/fullchain.pem',
    );
    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: keyFile,
        cert: certFile,
      },
    });
  } else {
    app = await NestFactory.create(AppModule);
  }
  app.enableCors();
  await app.listen(3001);
}

bootstrap();
