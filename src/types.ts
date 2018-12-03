import { V, Schema, Convert } from 'veni';
import * as Logger from 'bunyan';
import { ContractBinding } from './ContractBinding';

interface Contract2<
  ARG1 extends string,
  ARG2 extends string,
  TSchema extends { [key in ARG1 | ARG2]: Schema }
> {
  schema<T extends { [key in ARG1 | ARG2]: Schema }>(
    param: T
  ): Contract2<ARG1, ARG2, T>;

  fn<
    T extends (arg1: Convert<TSchema[ARG1]>, arg2: Convert<TSchema[ARG2]>) => R,
    R
  >(
    fn: T
  ): T;
}

export interface ContractMeta<TSchema> {
  getSchema(): TSchema;
}

interface Contract1<
  ARG1 extends string,
  TSchema extends { [key in ARG1]: Schema }
> {
  schema<T extends { [key in ARG1]: Schema }>(param: T): Contract1<ARG1, T>;

  fn<T extends (arg1: Convert<TSchema[ARG1]>) => R, R>(
    fn: T
  ): T & ContractBinding<T> & ContractMeta<TSchema>;
}

export interface Contract {
  config(config: Partial<ContractConfig>): this;
  options(options: Partial<ContractOptions>): this;
  params<ARG1 extends string>(arg1: ARG1): Contract1<ARG1, any>;
  params<ARG1 extends string, ARG2 extends string>(
    arg1: ARG1,
    arg2: ARG2
  ): Contract2<ARG1, ARG2, any>;
}

export interface ContractOptions {
  sync: boolean;
  removeOutput: boolean;
}

export interface ContractConfig {
  removeFields: string[];
  debug: boolean;
  depth: number;
  maxArrayLength: number;
  getLogger: (serviceName: string) => Logger;
  getNextId: () => number;
}
