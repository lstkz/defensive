import * as Logger from 'bunyan';
import { V } from 'veni';
import { Contract } from '../src/types';
import { createContract } from '../src/createContract';
import { setDefaultConfig } from '../src/defaultConfig';

let logger: Logger;

beforeEach(() => {
  logger = getLogger();
  let defaultId = 0;
  setDefaultConfig({
    getLogger: () => logger,
    getNextId: () => ++defaultId,
  });
});

function getLogger() {
  return ({
    error: jest.fn(),
    debug: jest.fn(),
  } as any) as Logger;
}

it('should throw if signature is invalid', () => {
  expect(() => {
    createContract('foo')
      .options({ sync: true })
      .params()
      .fn(() => 10);
  }).toThrowErrorMatchingInlineSnapshot(
    `"Invalid signature. Must be in format \\"service-name#method-name\\". Received \\"foo\\"."`
  );
});

it('validate sync function', () => {
  const fn = createContract('myService#fn')
    .options({ sync: true })
    .params('a')
    .schema({
      a: V.number().min(0),
    })
    .fn(a => a + 10);
  expect(() => {
    fn(10);
  }).not.toThrow();
  expect(() => {
    fn(-10);
  }).toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'a' must be greater or equal to 0."`
  );
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
});

it('validate sync with nested object', () => {
  const fn = createContract('myService#fn')
    .options({ sync: true })
    .params('params')
    .schema({
      params: V.object().keys({
        username: V.string().min(2),
        inner: V.object().keys({
          b: V.number().min(0),
        }),
      }),
    })
    .fn(params => params.username + '-' + params.inner.b);
  expect(() => {
    fn({ username: 'baz', inner: { b: -1 } });
  }).toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'params.inner.b' must be greater or equal to 0."`
  );
  expect(() => {
    fn({ username: 'b', inner: { b: 10 } });
  }).toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'params.username' length must be at least 2 characters long."`
  );
  expect(fn({ username: 'bar', inner: { b: 10 } })).toEqual('bar-10');
});

it('validate async function', async () => {
  const fn = createContract('myService#fn')
    .params('a')
    .schema({
      a: V.number().min(0),
    })
    .fn(async a => a + 10);
  await expect(fn(10)).resolves.toBe(20);
  await expect(fn(-10)).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'a' must be greater or equal to 0."`
  );
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
});

it('with removeOutput', () => {
  const fn = createContract('myService#fn')
    .options({ sync: true, removeOutput: true })
    .params('a')
    .schema({
      a: V.number().min(0),
    })
    .fn(a => a + 10);

  fn(10);
  expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
});
