import { Module } from '@nestjs/common';
import { EvmModule } from 'src/evm/evm.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  controllers: [RegistrationController],
  providers: [RegistrationService],
  imports: [
    PrismaModule,
    EvmModule
  ]
})
export class RegistrationModule { }
