import async_hooks from 'async_hooks';
import { ContractError } from './ContractError';
import { ContractHook } from './ContractHook';
import { ContractConfig } from './types';
import { _createContract } from './_createContract';

const defaultConfig: ContractConfig = {
  removeFields: ['password', 'token', 'accessToken'],
  debug: true,
  depth: 4,
  maxArrayLength: 30,
  debugEnter: (signature, formattedInput) => {
    // tslint:disable-next-line:no-console
    console.log(`ENTER ${signature}:`, formattedInput);
  },
  debugExit: (signature, formattedOutput) => {
    // tslint:disable-next-line:no-console
    console.log(`EXIT ${signature}:`, formattedOutput);
  },
  logError: err => {
    //
  },
};

export function initialize<T>(config: Partial<ContractConfig> = {}) {
  const hook = new ContractHook();
  return {
    createContract: _createContract(
      {
        ...config,
        ...defaultConfig,
      },
      hook
    ),
    runWithContext: (context: T, fn: (...args: any[]) => any) => {
      //
    },
    getContext: () => {
      return (null as any) as T;
    },
    disable: () => {
      hook.disable();
    },
  };
}
