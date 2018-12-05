import { createContract, ContractBinding } from '../src';
import { V } from 'veni';
import { Request, Response, default as express } from 'express';

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

declare module '../src' {
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
      res.json(getUser((req as any).user.id));
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
