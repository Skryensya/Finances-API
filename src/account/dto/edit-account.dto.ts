import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditAccountDto {
  @IsOptional()
  @IsString()
  name?: string;
}
