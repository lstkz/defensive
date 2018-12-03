import { ContractBinding } from './ContractBinding';
import { Router, Request, Response } from 'express';

ContractBinding.prototype.express = function(options) {
  if (!this.fn.expressOptions) {
    this.fn.expressOptions = [];
  }
  this.fn.expressOptions.push(options);
  return this.fn as any;
};

interface TestThis<T> {
  fn: T;
}

interface ExpressOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'path';
  path: string;
  handler(req: Request, res: Response): void;
}

declare module './ContractBinding' {
  interface ContractBinding<T> {
    expressOptions: ExpressOptions[];
    express(options: ExpressOptions): T & ContractBinding<T>;
  }
}
