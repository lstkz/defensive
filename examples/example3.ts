// import { createContract } from 'defensive';
import { createContract } from '../src';
import { V } from 'veni';

// SecurityService.ts

const hashPassword = createContract('SecurityService#hashPassword')
  .options({ sync: true })
  .params('password')
  .schema({
    password: V.string(),
  })
  .fn(password => 'ba817ef716');

hashPassword('secret-password');
