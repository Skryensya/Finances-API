import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignUpDto, SignInDto } from 'src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateAccountDto, EditAccountDto } from '../src/account/dto';

const SERVE_ON_PORT = 3333;

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(SERVE_ON_PORT);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(`http://localhost:${SERVE_ON_PORT}`);
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Auth ', () => {
    describe('signup', () => {
      it('should do a complete sign up', () => {
        const dto: SignUpDto = {
          email: 'user@test.com',
          password: 'password',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
        // .inspect();
      });
    });
    describe('singup fails', () => {
      it('should throw an exception if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
        // .inspect();
      });
      it('should throw an exception if no email ', () => {
        const dto: SignUpDto = {
          email: '',
          password: 'password',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
        // .inspect();
      });
      it('should throw an exception if no password', () => {
        const dto: SignUpDto = {
          email: 'user@test.com',
          password: '',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400);
        // .inspect();
      });
    });
    describe('signin', () => {
      it('should complete sign in', () => {
        const dto: SignInDto = {
          email: 'user@test.com',
          password: 'password',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('UserAt', 'access_token');
        // .inspect();
      });
    });
    describe('singin fails', () => {
      it('should throw an exception if no body', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
        // .inspect();
      });
      it('should throw an exception if no email', () => {
        const dto: SignInDto = {
          email: '',
          password: 'password',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
        // .inspect();
      });
      it('should throw an exception if no password', () => {
        const dto: SignInDto = {
          email: 'user@test.cl',
          password: '',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400);
        // .inspect();
      });
    });
  });
  describe('User CRUD', () => {
    describe('getMe', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(200);
        // .inspect();
      });
    });
    describe('EditUser', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          email: 'editedUser@test.com',
          firstname: 'editedFirstname',
          lastname: 'editedLastname',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstname)
          .expectBodyContains(dto.lastname);
        // .inspect();
      });
    });
    describe('EditUser fails', () => {
      it('should throw an exception if no body', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(400);
        // .inspect();
      });
    });
  });
  describe('Account CRUD', () => {
    describe('createAccount', () => {
      it('should create an account', () => {
        const dto: CreateAccountDto = {
          name: 'testAccount',
        };
        return pactum
          .spec()
          .post('/accounts/create')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .withBody(dto)
          .expectStatus(201)
          .stores('AccountId', 'id');
        // .inspect();
      });
    });
    describe('createAccount fails', () => {
      it('should throw an exception if no body', () => {
        return pactum
          .spec()
          .post('/accounts/create')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(400);
        // .inspect();
      });
      it('should throw an exception if no name', () => {
        const dto: CreateAccountDto = {
          name: '',
        };
        return pactum
          .spec()
          .post('/accounts/create')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .withBody(dto)
          .expectStatus(400);
        // .inspect();
      });
    });
    describe('editAccount', () => {
      it('should edit an account', () => {
        const dto: EditAccountDto = {
          name: 'editedAccountTest',
        };
        return pactum
          .spec()
          .patch('/accounts/edit/$S{AccountId}')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.name);
        // .inspect();
      });
    });
    describe('editAccount fails', () => {
      it('should throw an exception if no body', () => {
        return pactum
          .spec()
          .patch('/accounts/edit/$S{AccountId}')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(400);
        // .inspect();
      });
    });
    describe('getAccountById', () => {
      it('should get an account by id', () => {
        return pactum
          .spec()
          .get('/accounts/getOne/$S{AccountId}')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(200);
        // .inspect();
      });
    });
    describe('getAccountById fails', () => {
      it('should throw an exception if account not found', () => {
        return pactum
          .spec()
          .get('/accounts/getOne/')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(404)
          .inspect();
      });
    });
    describe('getAccounts', () => {
      it('should get all accounts', () => {
        return pactum
          .spec()
          .get('/accounts')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(200);
        // .inspect();
      });
    });
    describe('deleteAccount', () => {
      it('should delete an account', () => {
        return pactum
          .spec()
          .delete('/accounts/delete/$S{AccountId}')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(200);
        // .inspect();
      });
    });
    describe('deleteAccount fails', () => {
      it('should throw an exception if account not found', () => {
        return pactum
          .spec()
          .delete('/accounts/delete/')
          .withHeaders('Authorization', 'Bearer $S{UserAt}')
          .expectStatus(404);
        // .inspect();
      });
    });
  });
  // describe('Category CRUD', () => {
  //   describe('createCategory', () => {});
  //   describe('editCategory', () => {});
  //   describe('deleteCategory', () => {});
  //   describe('getCategoryById', () => {});
  //   describe('getCategories', () => {});
  // });
  // describe('Transaction CRUD', () => {
  //   describe('createTransaction', () => {});
  //   describe('editTransaction', () => {});
  //   describe('deleteTransaction', () => {});
  //   describe('getTransactionsById', () => {});
  //   describe('getTransactions', () => {});
  // });
});
