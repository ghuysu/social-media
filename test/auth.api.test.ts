import * as pactum from 'pactum';
import { any } from 'pactum-matchers';

function generateRandomEmail() {
  // Tạo một chuỗi ngẫu nhiên dài 10 ký tự
  const randomString = Math.random().toString(36).substring(2, 12);

  // Tạo email với chuỗi ngẫu nhiên và thêm đuôi @gmail.com
  const email = `${randomString}@gmail.com`;

  return email;
}

describe('auth', () => {
  const apiKey = 'abc-xyz-www';
  const registeredEmail = '7prz5epgqe@gmail.com';
  const randomEmail = generateRandomEmail();
  const user = {
    email: randomEmail,
    fullname: 'Huy Dao',
    password: 'HuyUyen-07021011',
    country: 'VN',
    birthday: '10/11/2003',
  };
  const admin = {
    email: 'socialmediapbl6@gmail.com',
    password: 'HuyUyen-07021011',
  };

  beforeAll(() => {
    pactum.request.setBaseUrl('http://localhost:10000/api');
  });

  describe('check email', () => {
    it('should throw conflict status', () => {
      return pactum
        .spec()
        .post('/user/email/check')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: registeredEmail,
        })
        .expectStatus(409)
        .expectJson({
          message: 'Existed Resource',
          error: 'Conflict',
          statusCode: 409,
        });
    });

    it('should throw unauthorized status', () => {
      return pactum
        .spec()
        .post('/user/email/check')
        .withBody({
          email: registeredEmail,
        })
        .expectStatus(401)
        .expectJson({
          message: 'Invalid API key',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should get code successfully', () => {
      return pactum
        .spec()
        .post('/user/email/check')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: randomEmail,
        })
        .expectStatus(200)
        .expectJsonMatch({
          status: 200,
          message: 'Verification code sent successfully.',
          metadata: {
            code: any(),
          },
        });
    });
  });

  describe('sign up new user', () => {
    it('should throw unauthorized status', () => {
      return pactum
        .spec()
        .post('/user/sign-up')
        .withBody(user)
        .expectStatus(401)
        .expectJson({
          message: 'Invalid API key',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should throw bad request status', () => {
      return pactum
        .spec()
        .post('/user/sign-up')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          ...user,
          email: 'abc',
          password: 'abc',
        })
        .expectStatus(400)
        .expectJsonMatch({
          message: ['email must be an email', 'password is not strong enough'],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should sign up successfully', () => {
      return pactum
        .spec()
        .post('/user/sign-up')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody(user)
        .expectStatus(201)
        .expectJsonMatch({
          status: 201,
          message: 'Created normal user successfully.',
          metadata: {
            user: any(),
          },
        });
    });
  });

  describe('sign in as user', () => {
    it('should throw not found credentials', () => {
      return pactum
        .spec()
        .post('/user/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: generateRandomEmail(),
          password: user.password,
        })
        .expectStatus(401)
        .expectJson({
          message: 'Not found credentials',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should throw incorrect credentials', () => {
      return pactum
        .spec()
        .post('/user/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: user.email,
          password: 'Abc_123',
        })
        .expectStatus(401)
        .expectJson({
          message: 'Incorrect credentials',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should sign in successfully', () => {
      return pactum
        .spec()
        .post('/user/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: user.email,
          password: user.password,
        })
        .expectStatus(200)
        .expectJsonMatch({
          status: 200,
          message: 'Signed in as normal user successfully.',
          metadata: {
            user: any(),
            signInToken: any(),
          },
        });
    });
  });

  describe('sign in as admin', () => {
    it('should throw not found credentials', () => {
      return pactum
        .spec()
        .post('/admin/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: generateRandomEmail(),
          password: admin.password,
        })
        .expectStatus(401)
        .expectJson({
          message: 'Not found credentials',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should throw incorrect credentials', () => {
      return pactum
        .spec()
        .post('/admin/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: admin.email,
          password: 'Abc_123',
        })
        .expectStatus(401)
        .expectJson({
          message: 'Incorrect credentials',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it('should sign in successfully', () => {
      return pactum
        .spec()
        .post('/admin/sign-in')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody(admin)
        .expectStatus(200)
        .expectJsonMatch({
          status: 200,
          message: 'Signed in as admin successfully.',
          metadata: {
            admin: any(),
            signInToken: any(),
          },
        });
    });
  });

  describe('check email for change password', () => {
    it('should throw not found status', () => {
      return pactum
        .spec()
        .post('/password/check')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: generateRandomEmail(),
        })
        .expectStatus(404)
        .expectJson({
          message: 'Not Found Resource',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should get code successfully', () => {
      return pactum
        .spec()
        .post('/password/check')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: registeredEmail,
        })
        .expectStatus(200)
        .expectJsonMatch({
          status: 200,
          message: 'Verification code sent successfully.',
          metadata: {
            code: any(),
          },
        });
    });
  });

  describe('change password', () => {
    it('should throw not found status', () => {
      return pactum
        .spec()
        .patch('/password')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: generateRandomEmail(),
          password: user.password,
        })
        .expectStatus(404)
        .expectJson({
          message: 'Not Found Resource',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should throw bad request status', () => {
      return pactum
        .spec()
        .patch('/password')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: registeredEmail,
          password: 'abc',
        })
        .expectStatus(400)
        .expectJson({
          message: ['password is not strong enough'],
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should change password successfully', () => {
      return pactum
        .spec()
        .patch('/password')
        .withHeaders({
          'x-api-key': apiKey,
        })
        .withBody({
          email: registeredEmail,
          password: 'Touyen-0702',
        })
        .expectStatus(200)
        .expectJsonMatch({
          status: 200,
          message: 'Change password successfully.',
        });
    });
  });
});
