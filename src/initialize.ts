import async_hooks from 'async_hooks';
import { ContractError } from './ContractError';
import { ContractHook } from './ContractHook';

interface InitializeOptions {
  removeFields: string[];
  debug: boolean;
  depth: number;
  maxArrayLength: number;
  debugEnter: (signature: string, args: any) => void;
  debugExit: (signature: string, result: any) => void;
  logError: (err: ContractError) => void;
}

export function initialize<T>(options: Partial<InitializeOptions> = {}) {
  const hook = new ContractHook();
  return {
    createContract: () => {
      //
    },
    runWithContext: (context: T, fn: (...args: any[]) => any) => {
      //
    },
    getContext: () => {
      return (null as any) as T;
    },
    disable: () => {
      //
    },
  };
}
