import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, EditAccountDto } from './dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async getAccounts(userId: number) {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
    });
    return accounts;
  }
  async getAccount(userId: number, accountId: number) {
    // try {
    const account = await this.prisma.account.findFirstOrThrow({
      where: {
        id: accountId,
        AND: {
          userId,
        },
      },
    });

    // if (!account) {
    //   throw new NotFoundException('Account not found');
    // }

    return account;
    // } catch (error) {
    //   throw new NotFoundException('Account not found');
    // }
  }

  async createAccount(userId: number, dto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: {
        name: dto.name,
        userId,
      },
    });
    return account;
  }

  async editAccount(userId: number, accountId: number, dto: EditAccountDto) {
    if (!dto.name) throw new BadRequestException('no changes were submited');

    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }
    const updatedAccount = await this.prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        ...dto,
      },
    });
    return updatedAccount;
  }

  async deleteAccount(userId: number, accountId: number) {
    const account = await this.prisma.account.findFirst({
      // where id == accountId and userId  == userId
      where: {
        id: accountId,
        AND: {
          userId,
        },
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const deletedAccount = await this.prisma.account.delete({
      where: {
        id: accountId,
      },
    });
    return deletedAccount;
  }
}
