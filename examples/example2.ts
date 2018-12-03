// import { createContract } from 'defensive';
import { createContract } from '../src';
import { V } from 'veni';

// UserService.ts

const createUser = createContract('UserService#createUser')
  .params('values')
  .schema({
    values: V.object().keys({
      name: V.string().optional(),
      email: V.string().email(),
      password: V.string().min(5),
    }),
  })
  .fn(async values => {
    // do something with values
    // UserModel.create(values);
    const id = 1;
    return id;
  });

async function test() {
  await createUser({
    name: 'john',
    email: 'john@example.com',
    password: 'secret',
  }); // ok
  await createUser({
    name: 'john',
    email: 'invalid email',
    password: 'secret',
  }); // throw error because email is invalid
}
test().catch(e => {
  throw e;
});
