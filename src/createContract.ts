import {
  Contract,
  ContractMeta,
  ContractConfig,
  ContractOptions,
} from './types';
import { wrapValidate } from './wrapValidate';
import { wrapLog } from './wrapLog';
import { SchemaMap } from 'veni';
import { ContractBinding } from './ContractBinding';
import { getDefaultConfig } from './defaultConfig';

export const createContract = (signature: string) => {
  const [serviceName, methodName] = signature.split('#');
  if (!methodName) {
    throw new Error(
      `Invalid signature. Must be in format "service-name#method-name". Received "${signature}".`
    );
  }
  const contract = {} as any;
  let config: ContractConfig = getDefaultConfig();
  let options: ContractOptions = {
    sync: false,
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
    const wrappedFunction = (...args: any[]) => {
      const logger = config.getLogger(serviceName);
      const withValidation = wrapValidate({
        keysSchema: schema,
        method: fn,
        paramNames: params,
        sync: options.sync,
      });

      const withLogging = wrapLog({
        logger,
        method: withValidation,
        methodName: methodName,
        paramNames: params,
        config,
        removeOutput: options.removeOutput,
      });
      return withLogging(...args);
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
