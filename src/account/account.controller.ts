import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { AccountService } from './account.service';
import { CreateAccountDto, EditAccountDto } from './dto';

@UseGuards(JwtGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  getAccounts(@GetUser('id') userId: number) {
    return this.accountService.getAccounts(userId);
  }

  @Get('getOne/:id')
  getAccount(
    @GetUser('id') userId: number,
    @Param('accountId') accountId: number,
  ) {
    return this.accountService.getAccount(userId, accountId);
  }

  @Post('create')
  createAccount(@GetUser('id') userId: number, @Body() dto: CreateAccountDto) {
    return this.accountService.createAccount(userId, dto);
  }

  @Patch('edit/:accountId')
  editAccount(
    @GetUser('id') userId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: EditAccountDto,
  ) {
    return this.accountService.editAccount(userId, accountId, dto);
  }

  @Delete('delete/:accountId')
  deleteAccount(
    @GetUser('id') userId: number,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.accountService.deleteAccount(userId, accountId);
  }
}
