import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import fs from 'fs';
async function bootstrap() {
  console.log('Starting server...');
  console.log(`Database URL: ${process.env.DATABASE_URL}`);

  const keyFile = fs.readFileSync(
    __dirname + '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/privkey.pem',
  );
  const certFile = fs.readFileSync(
    __dirname + '/etc/letsencrypt/live/algomon.kyle-jeffrey.com/fullchain.pem',
  );

  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: keyFile,
      cert: certFile,
    },
  });
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
