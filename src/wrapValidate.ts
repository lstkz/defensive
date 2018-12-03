import { V, SchemaLike, getValidateResult, validate, SchemaMap } from 'veni';
import { combineObject } from './combineObject';

export interface WrapValidateOptions<T> {
  keysSchema: SchemaMap | null;
  method: T;
  paramNames: string[];
  sync: boolean;
}

export function wrapValidate<T extends (...args: any[]) => any>(
  options: WrapValidateOptions<T>
): T {
  const { keysSchema, method, paramNames, sync } = options;

  return (((...args: any[]) => {
    const value = combineObject(paramNames, args);
    let normalized: any;
    try {
      normalized = validate(value, V.object().keys(keysSchema || {}));
    } catch (e) {
      if (sync) {
        throw e;
      }
      return Promise.reject(e);
    }
    const newArgs: any[] = [];
    // V will normalize values
    // for example string number '1' to 1
    // if schema type is number
    paramNames.forEach(param => {
      newArgs.push(normalized[param]);
    });
    return method(...newArgs);
  }) as any) as T;
}
