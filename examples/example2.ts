// import { initialize } from 'defensive';
import { initialize } from '../src';
import { V } from 'veni';

const { createContract } = initialize();

// SecurityService.ts

const hashPassword = createContract('SecurityService#hashPassword')
  .params('password')
  .schema({
    password: V.string(),
  })
  .fn(password => 'ba817ef716');

hashPassword('secret-password');
