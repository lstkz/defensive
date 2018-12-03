import './ExpressContract';
import { createContract } from './createContract';
import { V } from 'veni';

export const inc = createContract('inc')
  .params('n')
  .schema({
    n: V.number(),
  })
  .fn(n => {
    return n + 1;
  })
  .express({
    method: 'get',
    path: '/inc',
    handler: (req, res) =>
      res.json({
        result: inc(req.body.id),
      }),
  });

export const registerUser = createContract('registerUser')
  .params('values')
  .schema({
    values: V.object().keys({
      username: V.string()
        .min(3)
        .max(10),
      password: V.string()
        .min(5)
        .optional(),
    }),
  })
  .fn(async values => {
    return {
      id: 10,
      username: values.username,
    };
  })
  .express({
    method: 'post',
    path: '/register',
    handler: async (req, res) =>
      res.json({
        user: await registerUser(req.body),
      }),
  });

async function start() {
  await registerUser({
    username: 'foo',
    password: 'aabaaba',
  });
}

start();
