"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const fs = require("fs");
async function bootstrap() {
    console.log('Starting server...');
    console.log(`Database URL: ${process.env.DATABASE_URL}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    let options = {};
    if (process.env.NODE_ENV.replace(' ', '') != 'dev') {
        const keyFile = fs.readFileSync('/etc/letsencrypt/live/algomon.kyle-jeffrey.com/privkey.pem');
        const certFile = fs.readFileSync('/etc/letsencrypt/live/algomon.kyle-jeffrey.com/fullchain.pem');
        options = {
            key: keyFile,
            cert: certFile,
        };
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        httpsOptions: options,
    });
    app.enableCors();
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map