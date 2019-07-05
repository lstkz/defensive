// import { createContract } from 'defensive';
import { initialize } from '../src';
import { V } from 'veni';
import util from 'util';

// contract.ts

const { createContract, runWithContext } = initialize();

// CalcService.ts

const add = createContract('CalcService#add')
  .params('a', 'b')
  .schema({
    a: V.number(),
    b: V.number(),
  })
  .fn(async (a, b) => a + b);

(async function main() {
  try {
    await add(1, 3); // returns 4
    await add('5' as any, '6' as any); // returns 11, input parameters are converted to number types
    await add('1' as any, { foo: 'bar' } as any); // throws an error
  } catch (e) {
    console.error(util.inspect(e, { depth: null }));
  }
})();
