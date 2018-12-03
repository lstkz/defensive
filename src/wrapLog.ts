import * as Logger from 'bunyan';
import { combineObject } from './combineObject';
import { serializeObject } from './serializeObject';
import { ContractConfig } from './types';

export interface WrapLogOptions<T> {
  method: T;
  methodName: string;
  paramNames: string[];
  removeOutput: boolean;
  logger: Logger;
  config: ContractConfig;
}

export function wrapLog<T extends (...args: any[]) => any>(options: WrapLogOptions<T>): T {
  const { method, methodName, paramNames, removeOutput, logger, config } = options;

  const logExit = (output: string, id: number) => {
    const formattedOutput = removeOutput ? '<removed>' : serializeObject(config, output);
    logger.debug({ id }, ` EXIT ${methodName}:`, formattedOutput);
    return output;
  };
  return (function logDecorator(...args: any[]) {
    const id = config.getNextId();
    const formattedInput = paramNames.length
      ? serializeObject(config, combineObject(paramNames, args))
      : '{ }';
    logger.debug({ id }, `ENTER ${methodName}:`, formattedInput);
    let result;

    try {
      result = method(...args);
    } catch (e) {
      logger.error({ id }, `ERROR ${methodName}: ${formattedInput} \n`, e);
      throw e;
    }
    // promise (or async function)
    if (result && typeof result.then === 'function') {
      return result
        .then((asyncResult: any) => {
          logExit(asyncResult, id);
          return asyncResult;
        })
        .catch((e: Error) => {
          logger.error({ id }, `ERROR ${methodName}: ${formattedInput} \n`, e);
          throw e;
        });
    }
    logExit(result, id);
    return result;
  } as any) as T;
}
