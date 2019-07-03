import { SchemaMap } from 'veni';
import {
  Contract,
  ContractMeta,
  ContractConfig,
  ContractOptions,
} from './types';
import { wrapValidate } from './wrapValidate';
import { wrapLog } from './wrapLog';
import { ContractBinding } from './index';
import { ContractHook } from './ContractHook';
import { ContractError } from './ContractError';
import { _serializeInput } from './_serializeInput';

export const _createContract = (config: ContractConfig, hook: ContractHook) => (
  signature: string
) => {
  const contract = {} as any;
  let options: ContractOptions = {
    removeOutput: false,
  };
  let params: string[] = [];
  let schema: SchemaMap | null = null;

  const meta: ContractMeta<any> = {
    getSchema: () => schema,
  };

  contract.params = (...args: string[]) => {
    params = args;
    return contract;
  };

  contract.schema = (arg: any) => {
    schema = arg;
    return contract;
  };

  contract.config = (value: any) => {
    config = { ...config, ...value };
    return contract;
  };

  contract.options = (value: any) => {
    options = { ...options, ...value };
    return contract;
  };

  contract.fn = (fn: any) => {
    const wrappedFunction = async (...args: any[]) => {
      const withValidation = wrapValidate({
        keysSchema: schema,
        method: fn,
        paramNames: params,
      });

      const withLogging = wrapLog({
        signature,
        method: withValidation,
        paramNames: params,
        config,
        removeOutput: options.removeOutput,
      });
      const isNewScope = hook.isNewScope();
      try {
        if (isNewScope) {
          const a = await hook.runInNewScope(() => withLogging(...args));
          return a;
        } else {
          return await withLogging(...args);
        }
      } catch (e) {
        const input = _serializeInput(config, params, args);
        if (e instanceof ContractError) {
          e.entries.unshift({
            signature,
            input,
          });
          throw e;
        } else {
          throw new ContractError(e, [
            {
              signature,
              input,
            },
          ]);
        }
      }
    };
    const contractBinding = new ContractBinding();
    contractBinding.fn = wrappedFunction;
    const functions = Object.keys(ContractBinding.prototype);
    const ret = Object.assign(wrappedFunction, meta) as any;

    functions.forEach(name => {
      ret[name] = (contractBinding as any)[name].bind(contractBinding);
    });
    return ret;
  };

  return contract as Contract;
};
