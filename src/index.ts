export * from './initialize';
export * from './ContractError';
export * from './types';

export class ContractBinding<T> {
  fn?: T;
}
