import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailingModule } from './emailing/emailing.module';
import { RegistrationModule } from './registration/registration.module';
import { TransactionHandlerModule } from './transaction-handler/transaction-handler.module';

@Module({
  imports: [
    EmailingModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available globally
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    RegistrationModule,
    TransactionHandlerModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
  exports: [
    AppService
  ]
})
export class AppModule { }
