import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './../config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // 60 sekund (millisekundda)
    //     limit: 10, // Maksimum 10 ta so'rov
    //   },
    // ]),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        try {
          console.log('⏳ Connecting to PostgreSQL...');

          return {
            type: 'postgres',
            url: appConfig.dbUrl,
            synchronize: true,
            entities: ['dist/core/entity/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            ssl:
              appConfig.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        } catch (err) {
          console.error('❌ PostgreSQL connection failed:', err.message);
          process.exit(1); // yoki throw err
        }
      },
    }),
    JwtModule.register({ global: true }),
  ],
  controllers: [],
  providers: [
    // {
    //   // provide: APP_GUARD,
    //   // useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
