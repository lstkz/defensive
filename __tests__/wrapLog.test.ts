import * as Logger from 'bunyan';
import { wrapLog } from '../src/wrapLog';
import { ContractConfig } from '../src/types';

let globalConfig: ContractConfig;

beforeEach(() => {
  let id = 0;
  globalConfig = {
    removeFields: ['password', 'token', 'accessToken'],
    debug: true,
    depth: 4,
    maxArrayLength: 30,
    getLogger(serviceName: string) {
      return null as any;
    },
    getNextId: () => ++id,
  };
});

function getLogger() {
  return ({
    error: jest.fn(),
    debug: jest.fn(),
  } as any) as Logger;
}

it('log sync', () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: (a: number) => a + 10,
    methodName: 'testMethod',
    paramNames: ['a'],
    config: globalConfig,
    removeOutput: false,
  });
  expect(fn(1)).toBe(11);
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ a: 1 }",
  ],
  Array [
    Object {
      "id": 1,
    },
    " EXIT testMethod:",
    "11",
  ],
]
`);
});

it('log async', async () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: async (a: number) => a + 10,
    methodName: 'testMethod',
    paramNames: ['a'],
    config: globalConfig,
    removeOutput: false,
  });
  await expect(fn(1)).resolves.toBe(11);
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ a: 1 }",
  ],
  Array [
    Object {
      "id": 1,
    },
    " EXIT testMethod:",
    "11",
  ],
]
`);
});

it('sanitized input', () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: (password: string, values: { accessToken: string; foo: number }) =>
      'ok',
    methodName: 'testMethod',
    paramNames: ['password', 'values'],
    config: globalConfig,
    removeOutput: false,
  });
  expect(fn('pass', { accessToken: 'token', foo: 123 })).toBe('ok');
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ password: '<removed>',
  values: { accessToken: '<removed>', foo: 123 } }",
  ],
  Array [
    Object {
      "id": 1,
    },
    " EXIT testMethod:",
    "'ok'",
  ],
]
`);
});

it('remove output', () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: (a: number) => a + 10,
    methodName: 'testMethod',
    paramNames: ['a'],
    config: globalConfig,
    removeOutput: true,
  });
  expect(fn(1)).toBe(11);
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ a: 1 }",
  ],
  Array [
    Object {
      "id": 1,
    },
    " EXIT testMethod:",
    "<removed>",
  ],
]
`);
});

it('sync error', () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: () => {
      throw new Error('some error');
    },
    methodName: 'testMethod',
    paramNames: [],
    config: globalConfig,
    removeOutput: false,
  });
  expect(() => fn()).toThrow();
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ }",
  ],
]
`);
  expect((logger.error as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ERROR testMethod: { } 
",
    [Error: some error],
  ],
]
`);
});

it('async error', async () => {
  const logger = getLogger();
  const fn = wrapLog({
    logger,
    method: async () => {
      throw new Error('some error');
    },
    methodName: 'testMethod',
    paramNames: [],
    config: globalConfig,
    removeOutput: false,
  });
  await expect(fn()).rejects.toThrow();
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ENTER testMethod:",
    "{ }",
  ],
]
`);
  expect((logger.error as jest.Mock<any>).mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "id": 1,
    },
    "ERROR testMethod: { } 
",
    [Error: some error],
  ],
]
`);
});
