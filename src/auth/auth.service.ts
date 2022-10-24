import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email: email,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      algorithm: 'HS256',
      secret,
    });

    return {
      access_token: token,
    };
  }
  async signup(dto: SignUpDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    // save new user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: SignInDto) {
    // find user in db by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist, throw an exception
    if (!user) {
      throw new ForbiddenException('Invalid Credentials');
    }

    // compare the password
    const valid = await argon.verify(user.hash, dto.password);

    // if incorrect we throw an exception
    if (!valid) {
      throw new ForbiddenException('Invalid Credentials');
    }

    // send back the user without the hash

    return this.signToken(user.id, user.email);
  }
}
