import async_hooks from 'async_hooks';

export class ContractHook {
  private asyncHook: async_hooks.AsyncHook = null!;
  private rootMapping: Map<number, number> = new Map();
  private groups: Map<number, number[]> = new Map();

  constructor() {
    this.asyncHook = async_hooks.createHook({
      init: (asyncId, type, triggerAsyncId, resource) => {
        if (!this.rootMapping.has(triggerAsyncId)) {
          return;
        }
        const rootId = this.rootMapping.get(triggerAsyncId)!;
        this.rootMapping.set(asyncId, rootId);
        if (!this.groups.has(rootId)) {
          this.groups.set(rootId, []);
        }
        this.groups.get(rootId)!.push(asyncId);
      },
      destroy: asyncId => {
        if (!this.rootMapping.has(asyncId)) {
          return;
        }
        const rootId = this.rootMapping.get(asyncId)!;
        if (rootId !== asyncId) {
          return;
        }
        const ids = this.groups.get(asyncId) || [];
        ids.forEach(id => {
          this.rootMapping.delete(id);
        });
        this.groups.delete(asyncId);
      },
    });
  }

  addRoot(asyncId: number) {
    this.rootMapping.set(asyncId, asyncId);
  }

  enable() {
    this.asyncHook.enable();
  }

  disable() {
    this.asyncHook.disable();
  }
}
