import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigurationModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './modules/user/user.module';
import { DocumentModule } from './modules/document/document.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    AuthModule,
    CommonModule,
    UserModule,
    DocumentModule,
    HealthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 1,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
