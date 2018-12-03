import * as Logger from 'bunyan';
import { ContractConfig } from './types';

export const getConfig = (config?: Partial<ContractConfig>): ContractConfig => {
  let defaultId = 0;
  const loggerMap: Record<string, Logger> = {};
  return {
    removeFields: ['password', 'token', 'accessToken'],
    debug: true,
    depth: 4,
    maxArrayLength: 30,
    getLogger(serviceName: string) {
      if (!loggerMap[serviceName]) {
        loggerMap[serviceName] = Logger.createLogger({
          name: serviceName,
          level: this.debug ? 'debug' : 'error',
        });
      }
      return loggerMap[serviceName];
    },
    getNextId: () => ++defaultId,
    ...(config || {}),
  };
};
