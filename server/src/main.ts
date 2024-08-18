import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
async function bootstrap() {
  console.log('Starting server...');
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  let options = {};
  if (process.env.NODE_ENV.replace(' ', '') != 'dev') {
    const keyFile = fs.readFileSync(
      '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/privkey.pem',
    );
    const certFile = fs.readFileSync(
      '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/fullchain.pem',
    );
    options = {
      key: keyFile,
      cert: certFile,
    };
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions: options,
  });
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
