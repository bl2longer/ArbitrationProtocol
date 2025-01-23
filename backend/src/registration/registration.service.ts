import { HttpException, Injectable } from '@nestjs/common';
import { EvmService } from 'src/evm/evm.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArbiterRegistrationDTO } from './dto/arbiter-registration.dto';
import { ArbiterStatusDTO } from './dto/arbiter-status.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private evm: EvmService
  ) { }

  public async getArbiterStatus(arbiterOwnerAddress: string): Promise<ArbiterStatusDTO> {
    const arbiter = await this.prisma.arbiter.findFirst({
      where: { ownerEvmAddress: arbiterOwnerAddress }
    });

    return { arbiterOwnerAddress, emailKnown: !!arbiter?.email };
  }

  public async startArbiterRegistration(registrationDTO: ArbiterRegistrationDTO) {
    const { ownerAddress, email, evmChallengePayload, signature } = registrationDTO;

    // Ensure no missing parameters
    if (!ownerAddress || !email || !evmChallengePayload || !signature)
      throw new HttpException("Missing parameters", 403);

    // Ensure signature is valid
    if (!this.evm.isSignatureValid(evmChallengePayload, signature, ownerAddress))
      throw new HttpException("Invalid signature", 403);

    await this.prisma.arbiter.upsert({
      where: { ownerEvmAddress: ownerAddress },
      update: { email },
      create: { ownerEvmAddress: ownerAddress, email }
    });
  }
}
