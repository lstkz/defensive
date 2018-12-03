import { createContract } from './createContract';
import { V } from 'veni';
import './ExpressContract';

export const getUser = createContract('User#getUser')
  .params('id')
  .schema({
    id: V.number(),
  })
  .fn(async id => {
    return {
      id,
      username: 'name',
    };
  })
  .express({
    method: 'get',
    path: '/users/me',
    handler(req, res) {
      res.json(getUser((req as any).user.id));
    },
  })
  .express({
    method: 'get',
    path: '/users/:id',
    handler(req, res) {
      res.json(getUser(req.params.id));
    },
  });

getUser(12);

console.log(getUser.expressOptions);
