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
};

export function initialize<T>(config: Partial<ContractConfig> = {}) {
  const hook = new ContractHook();
  hook.enable();
  return {
    createContract: _createContract(
      {
        ...defaultConfig,
        ...config,
      },
      hook
    ),
    runWithContext: async (context: T, fn: () => any) => {
      await hook.runInNewScope(() => {
        hook.setContext(context);
        return fn();
      });
    },
    getContext: () => hook.getContext<T>(),
    disable: () => {
      hook.disable();
    },
  };
}
