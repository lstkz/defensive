# defensive


`defensive` is a TypeScript library for creating contracts (aka services) with a proper validation and logging.  
It depends on [veni](https://github.com/BetterCallSky/veni) (validator).  
Only node v10 and v12 are supported.


[![Travis](https://img.shields.io/travis/BetterCallSky/defensive.svg)](https://travis-ci.org/BetterCallSky/defensive)
[![codecov](https://codecov.io/gh/BetterCallSky/defensive/branch/master/graph/badge.svg)](https://codecov.io/gh/BetterCallSky/defensive)
[![Dev Dependencies](https://david-dm.org/BetterCallSky/defensive/dev-status.svg)](https://david-dm.org/BetterCallSky/defensive?type=dev)


### About
The motivation is to provide a library for [contract programming](https://en.wikipedia.org/wiki/Design_by_contract) that works well with TypeScript.  
There are many existing libraries for data validation that rely heavily on decorator annotations. Unfortunately, decorators have many flaws:
- it's an experimental feature, and its syntax is going to change,
- redundant syntax because we must create special classes instead of using plain objects,
- it's a runtime feature, and there are some [bugs related to reflection](https://github.com/kulshekhar/ts-jest/issues/439),
- no type inference, any typos or mistakes cause a runtime error instead of a compilation error.

 Since Typescript 2.8, it's possible to use [conditional types](https://github.com/Microsoft/TypeScript/pull/21496), that allow us to map one type to another. It's a powerful feature that can extract a Typescript interface from javascript objects (implemented by [veni](https://github.com/BetterCallSky/veni)).

 See the example below. There are no TypeScript annotations. It's pure JavaScript code, but we have type checking inferred from Veni.


![Alt text](./.github/type-checking.gif)

### Features

- Full type inference for input parameters.
- Input validation and normalization (example: string type `"2"` to number type `2`).
- Input logging (input parameters):
```
ENTER myService#methodName: {param1: 'foo', param2: 'bar'}
```
- Output logging:
```
EXIT myService#methodName: {result: 'foobar', anotherProp: 'bar'}
```
- Error logging with input parameters (see example below).
- Bindings to 3rd party frameworks (see example below).

### Getting Started

```bash
npm install defensive
```
```bash
yarn add defensive
```

## Example usage 

```ts
// contract.ts
export const { createContract } = initialize();

// services/CalcService.ts
import { V } from 'veni';
import { createContract } from './contract';
import util from 'util';

export const add = createContract('CalcService#add')
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
    // NOTE: you shouldn't use casting `as any` in your code. It's used only for a demonstration purpose.
    // The service is expected to be called with unknown input (for example: req.body).
  } catch (e) {
    console.error(util.inspect(e, { depth: null }));
  }
})();
```
```
$ ts-node -T examples/example1.ts
ENTER CalcService#add: { a: 1, b: 3 }
EXIT CalcService#add: 4
ENTER CalcService#add: { a: '5', b: '6' }
EXIT CalcService#add: 11
ENTER CalcService#add: { a: '1', b: { foo: 'bar' } }
{ Error: ContractError: Validation error: 'b' must be a number.
    at wrappedFunction (/defensive/src/_createContract.ts:81:17)
    at process._tickCallback (internal/process/next_tick.js:68:7)
    at Function.Module.runMain (internal/modules/cjs/loader.js:744:11)
    at Object.<anonymous> (/Users/sky/.nvm/versions/node/v10.12.0/lib/node_modules/ts-node/src/bin.ts:158:12)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
  original:
   { Error: Validation error: 'b' must be a number.
       at new ValidationError (/defensive/node_modules/veni/ValidationError.js:19:28)
       at Object.exports.validate (/defensive/node_modules/veni/validate.js:37:21)
       at /defensive/src/wrapValidate.ts:17:24
       at logDecorator (/defensive/src/wrapLog.ts:40:26)
       at hook.runInNewScope (/defensive/src/_createContract.ts:67:52)
       at AsyncResource.runInAsyncScope (async_hooks.js:188:21)
       at ContractHook.runInNewScope (/defensive/src/ContractHook.ts:45:26)
       at wrappedFunction (/defensive/src/_createContract.ts:67:32)
       at main (/defensive/examples/example1.ts:23:11)
       at process._tickCallback (internal/process/next_tick.js:68:7) errors: [ [Object] ] },
  entries:
   [ { signature: 'CalcService#add',
       input: '{ a: \'1\', b: { foo: \'bar\' } }' } ] }
```

See example under `examples/example1.ts`. Run it using `npm run example1`.


## Removing security information
By default properties `password`, `token`, `accessToken` are removed from logging.  
Additionally you set options to `{removeOutput: true}` to remove the method result.  
Example:

file `services/SecurityService.ts`
```ts
// services/SecurityService.ts
import { createContract } from 'defensive';
import { V } from 'veni';
 
const hashPassword = createContract('SecurityService#hashPassword')
  .options({ sync: true })
  .params('password')
  .schema({
    password: V.string(),
  })
  .fn(password => 'ba817ef716');

hashPassword('secret-password');
```
``
$ ts-node -T examples/example2.ts
ENTER SecurityService#hashPassword: { password: '<removed>' }
EXIT SecurityService#hashPassword: 'ba817ef716'
``

See example under `examples/example2.ts`. Run it using `npm run example2`.


### Special properties
if the parameter name is `req` it's assumed that the object is an express request.  
Only properties are logged: `method`, `url`, `headers`, `remoteAddress`, `remotePort`.  


if the parameter name is `res` it's assumed that the object is an express response.  
Only properties are logged: `statusCode`, `header`.  

### Notes
- The wrapped function must have 0-4 arguments. 
- You can always override the inferred type. For example, if you to skip strict validation of properties.

```ts
createContract('CalcService#add')
  .params('foo')
  .schema({
    foo: V.object(),
  })
  .fn((foo: SomeExistingObject) => {

  });

```

## Creating bindings
It's possible to extend the contract prototype and add custom metadata that can be used to mount the contract in 3rd party frameworks or library.  
For example: you can create your own binding for an express app, graphql app, kafka events or cron jobs.  

Example binding for Express  
```ts
import { initialize, ContractBinding } from 'defensive';
import { V } from 'veni';
import { Request, Response, default as express } from 'express';

const { createContract } = initialize();

// Creating binding definition
// bindings.ts

ContractBinding.prototype.express = function(options) {
  if (!this.fn.expressOptions) {
    this.fn.expressOptions = [];
  }
  this.fn.expressOptions.push(options);
  return this.fn as any;
};

interface ExpressOptions {
  auth?: boolean;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  handler(req: Request, res: Response): void;
}

declare module 'defensive' {
  interface ContractBinding<T> {
    expressOptions: ExpressOptions[];
    express(options: ExpressOptions): T & ContractBinding<T>;
  }
}

// Create service
// UserService.ts

export const getUser = createContract('User#getUser')
  .params('id')
  .schema({
    id: V.number(),
  })
  .fn(async id => {
    return {
      id,
      username: 'name',
    };
  })
  .express({
    auth: true,
    method: 'get',
    path: '/users/me',
    handler(req, res) {
      res.json(getUser(req.user.id));
    },
  })
  .express({
    method: 'get',
    path: '/users/:id',
    handler(req, res) {
      res.json(getUser(req.params.id));
    },
  });

// Main entry point
// app.ts

const app = express();

const authMiddleware = (req: Request, res: Response) => {
  // check if user is logged in
};

getUser.expressOptions.forEach(options => {
  const middleware = [options.handler];
  if (options.auth) {
    middleware.unshift(authMiddleware);
  }
  app[options.method](options.path, ...middleware);
});
```

### API
1. `initialize` - initialize the library.
```ts
const {
  createContract,
  runWithContext,
  getContext,
  disable
  } = initialize({
  // an array of fields to be removed when formatting input or output
  removeFields: ['password', 'token', 'accessToken'],
  // true if enable debugEnter and debugExit, it can be disabled in production
  debug: true,
  // the object depth when serializing nested object
  depth: 4,
  // the max array length to be serialized
  maxArrayLength: 30,
  // the function for handling ENTER event
  // formattedInput is a serialized contract input
  debugEnter: (signature, formattedInput) => {
    console.log(`ENTER ${signature}:`, formattedInput);
  },
  // the function for handling EXI event
  // formattedOutput is a serialized contract output
  debugExit: (signature, formattedOutput) => {
    console.log(`EXIT ${signature}:`, formattedOutput);
  },
})
```
2. `createContract` - create a new contract.
```ts
const add = createContract('CalcService#add') // the function signature
  .params('a', 'b') // input parameter names
  .schema({
    a: V.number(), // validation schema for each defined param
    b: V.number(), // names must match
  })
  .fn(async (a, b) => a + b) // the implementation
```
3. `runWithContext` - run the given function with a given context.
```ts
const context = { user: { id: 1 } };
await runWithContext(context, async () => {
  await add(1, 2);
})
```

4. `getContext` - get current context or throw an error if not set. The parent function must call `runWithContext`.
```ts
const { createContract, getContext, runWithContext } = initialize<Context>({
  debug: false,
});
const fn1 = await createContract('myService#fn1')
  .params()
  .fn(async () => {
    const context = getContext();
    return context.foo;
  });
const fn2 = await createContract('myService#fn2')
  .params()
  .fn(async () => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve(fn1());
      }, 0)
    );
  });
await runWithContext(
  {
    foo: 'bar',
  },
  async () => {
    await fn2(); // returns 'bar'
  }
)
```

## FAQ
1. Why can't I just use [express validator](https://express-validator.github.io/docs/) and write code directly in controllers?  

Such an approach can work for small apps, but it can complicate things if the application is growing. It's a common scenario when you write the code in one place, and then you must reuse it in another place.  
For example:  
You create an endpoint `/POST register` for user registration.  
After some time, you must create a command line script that will register a default user.  
You can't call the express router from the command line (you can try but it's a hacky solution), and you must either extract logic to common file (util or helper) or duplicate code. The application is much easier to understand if the business operations are organized in contracts/services instead of chaotic helper methods.

2. Why do you recommend to keep bindings and services in a single file?  
  
Most of the services are usually small, and there is 1:1 mapping between them and REST endpoints. It can be overwhelming for the developer when adding a new simple endpoint requires editing multiple files (controllers/services/route config).

3. Why bindings are not provided by this library?  
  
It's difficult to create a generic binding that will work well for all users. It's recommended to create a minimal binding that all only needed in your app.

### License
MIT