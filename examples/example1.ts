// import { createContract } from 'defensive';
import { createContract } from '../src';
import { V } from 'veni';

// CalcService.ts

const add = createContract('CalcService#add')
  .options({ sync: true })
  .params('a', 'b')
  .schema({
    a: V.number(),
    b: V.number(),
  })
  .fn((a, b) => a + b);

add(1, 3); // returns 4
add('5' as any, '6' as any); // returns 11, input parameters are converted to number types
add('1' as any, { foo: 'bar' } as any); // logs and throws an error
