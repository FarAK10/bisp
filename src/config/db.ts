import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export default TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres', // or 'mysql' for MySQL
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT')),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true, // Set to false in production
  }),
});
