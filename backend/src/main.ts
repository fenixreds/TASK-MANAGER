import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Polyfill para crypto si no está disponible (workaround)
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto as any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://frontend:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API completa para gestión de tareas con subtareas multinivel')
    .setVersion('1.0')
    .addTag('tasks', 'Operaciones relacionadas con tareas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log('🚀 Task Management API iniciada');
  console.log(`📡 Servidor ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);

  // Log de verificación de crypto
  try {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
      const testUUID = globalThis.crypto.randomUUID();
      console.log(`✅ Crypto disponible - UUID de prueba: ${testUUID.slice(0, 8)}...`);
    } else {
      console.log('⚠️ Crypto no disponible directamente, usando polyfill');
    }
  } catch (error) {
    console.log('❌ Error con crypto:', error.message);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});