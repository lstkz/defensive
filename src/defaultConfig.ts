// import * as Logger from 'bunyan';
// import { ContractConfig } from './types';

// let defaultId = 0;

// const loggerMap: Record<string, Logger> = {};

// const defaultConfig: ContractConfig = {
//   removeFields: ['password', 'token', 'accessToken'],
//   debug: true,
//   depth: 4,
//   maxArrayLength: 30,
//   getLogger(serviceName: string) {
//     if (!loggerMap[serviceName]) {
//       loggerMap[serviceName] = Logger.createLogger({
//         name: serviceName,
//         level: this.debug ? 'debug' : 'error',
//       });
//     }
//     return loggerMap[serviceName];
//   },
//   getNextId: () => ++defaultId,
// };

// export const setDefaultConfig = (config: Partial<ContractConfig>) => {
//   Object.assign(defaultConfig, config);
// };

// export const getDefaultConfig = () => defaultConfig;
