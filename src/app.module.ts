import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigurationModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './modules/user/user.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, AuthModule, CommonModule, UserModule, DocumentModule],
})
export class AppModule {}
