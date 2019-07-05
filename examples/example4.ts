// import { initialize } from 'defensive';
import { initialize } from '../src';

interface Context {
  foo: string;
}

const { createContract, getContext, runWithContext } = initialize<Context>();

const fn = createContract('myService#fn2')
  .params()
  .fn(async () => {
    return new Promise(resolve =>
      // here will be created a new scope in the event loop
      setTimeout(() => {
        const context = getContext();
        resolve(context.foo);
      }, 0)
    );
  });
runWithContext(
  {
    foo: 'bar',
  },
  async () => {
    console.log(await fn()); // returns 'bar'
  }
);
