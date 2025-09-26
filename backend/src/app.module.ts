import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/task.module';
import { Task } from './entities/task.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Task],

        // Configuración simplificada para evitar problemas con crypto
        synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development' ? ['error'] : false,
        dropSchema: false,

        // Configuración de conexión sin UUIDs problemáticos
        extra: {
          max: 5,
          min: 1,
          acquire: 30000,
          idle: 10000,
        },

        // Evitar el uso automático de UUIDs que causan el error crypto
        namingStrategy: undefined,
        entityPrefix: '',
      }),
    }),
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('🗄️ Configuración de base de datos simplificada iniciada');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
    console.log(`   Base de datos: ${process.env.DB_NAME || 'task_management'}`);
  }
}
