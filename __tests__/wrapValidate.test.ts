import { V } from 'veni';
import { wrapValidate } from '../src/wrapValidate';

it('wrap sync', () => {
  const fn = wrapValidate({
    keysSchema: {
      a: V.number().min(0),
    },
    method: (a: number) => a + 10,
    paramNames: ['a'],
    sync: true,
  });
  expect(fn(1)).toEqual(11);
  expect(fn('1' as any)).toEqual(11);
  expect(() => fn(-1)).toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'a' must be greater or equal to 0."`
  );
});

it('wrap async', async () => {
  const fn = wrapValidate({
    keysSchema: {
      a: V.number().min(0),
    },
    method: async (a: number) => a + (await Promise.resolve(10)),
    paramNames: ['a'],
    sync: false,
  });
  await expect(fn(1)).resolves.toEqual(11);
  await expect(fn('1' as any)).resolves.toEqual(11);
  await expect(fn(-1)).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Validation error: 'a' must be greater or equal to 0."`
  );
});
