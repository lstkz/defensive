// tslint:disable:no-console

import async_hooks from 'async_hooks';

const getIds = () => ({
  triggerId: async_hooks.triggerAsyncId(),
  asyncId: async_hooks.executionAsyncId(),
});

async function fn4() {
  process._rawDebug('@enter fn4', getIds());
  await main1();
  process._rawDebug('@exit fn4', getIds());
}

async function fn3() {
  process._rawDebug('@enter fn3', getIds());
  await new Promise(resolve => setTimeout(resolve, 1));
  process._rawDebug('@exit fn3', getIds());
}

async function fn2() {
  process._rawDebug('@enter fn2', getIds());
  await fn3();
  process._rawDebug('@exit fn2', getIds());
}

const map: { [x: number]: number } = {};
const paths: { [x: number]: number[] } = {};

const nextId = 10;

async function runInContext<T>(f: () => Promise<T>) {
  if (map[async_hooks.executionAsyncId()]) {
    await f();
    return;
  }
  const asyncResource = new async_hooks.AsyncResource('REQUEST_CONTEXT');
  const asyncId = asyncResource.asyncId();
  map[asyncId] = asyncId;
  process._rawDebug('@@@@@@', { asyncId });
  await asyncResource.runInAsyncScope(f);
  asyncResource.emitDestroy();
}

async function main1() {
  await runInContext(fn2);
}

async function main2() {
  await runInContext(fn4);
}

function getRoot(id: number) {
  // process._rawDebug('getRoot', id, map);
  let ret = id;
  while (map[ret] !== ret) {
    ret = map[ret];
  }
  // map[id] = ret;
  return ret;
  // if (map[id] === id) {
  //   return id;
  // }
}

const asyncHook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    if (!map[triggerAsyncId]) {
      return;
    }
    process._rawDebug('init', {
      asyncId,
      // type,
      triggerAsyncId,
      // resource,
    });
    // const rootId = getRoot(triggerAsyncId);
    const rootId = map[triggerAsyncId];
    map[asyncId] = rootId;
    if (!paths[rootId]) {
      paths[rootId] = [];
    }
    paths[rootId].push(asyncId);
    // if (triggerAsyncId === 1) {
    //   map[asyncId] =
    // }
  },
  before(asyncId) {
    process._rawDebug('before', { asyncId });
  },
  after(asyncId) {
    process._rawDebug('after', { asyncId });
  },
  destroy(asyncId) {
    process._rawDebug('destroy', { asyncId });
  },
});

asyncHook.enable();

// fn().then(() => {
//   process._rawDebug('----------------');
//   fn();
// });

async function start() {
  process._rawDebug('----------------');
  process._rawDebug('start 1', getIds());
  // await fn();
  // process._rawDebug('----------------');
  // process._rawDebug('start 2', getIds());
  // await fn();

  // process._rawDebug('----------------');
  // process._rawDebug('----------------');
  // process._rawDebug('----------------');
  // await Promise.all([main1(), main1()]);
  await main2();

  process._rawDebug(paths);

  // setTimeout(() => {}, 1000);
}

start();
// setTimeout(() => {
//   start();
// }, 0);

// fn();
// fn();
