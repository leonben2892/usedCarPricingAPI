import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user sign up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {}
  });

  it('throws an error if signin is called with an unused email', async () => {
    try {
      await service.signin('sada@safda.com', 'asdasd');
    } catch (err) {}
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', '1234');
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (err) {}
  });

  it('returns a user if a correct password is provided', async () => {
    await service.signup('asdf@asdf.com', '1234');

    const user = await service.signin('asdf@asdf.com', '1234');

    expect(user).toBeDefined();
  });
});
