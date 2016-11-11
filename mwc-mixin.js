import { Tracker } from 'meteor/tracker';
import { Random } from 'meteor/random';

const mwcDataUpdate = (element) => {
  const data = element.getMeteorData();
  //  if(element.getMeteorData()){
  //  console.log('Use tracker instead of getMeteorData');
  //  }
  if (!data) {
    return;
  }

  if (element.__mwcFirstRun) {
    element.__mwcFirstRun = false;
    element._mwcSetData(data);
    return;
  }

  Tracker.afterFlush(() => {
    element._mwcSetData(data);
  });
};

mwcMixin = {
  properties: {
    subsReady: { type: Boolean, notify: true, value: true },
    mwcData: Object,
    __mwcHandles: { type: Array, value: [] },
    __mwcPush: { type: Array, value: [] },
    __mwcComputations: { type: Array, value: [] },
    __mwcComputationsIds: { type: Array, value: [] },
    __mwcBin: { type: Array, value: [] },
  },
  trackers: [],
  _mwcSetData(data) {
    this.set('mwcData', data);
  },
  beforeRegister() {
    const mwcDeps = {};
    const observers = this.observers || [];
    const trackers = this.trackers;
    for (let i = 0; i < trackers.length; i += 1) {
      const tracker = trackers[i];
      const sections = tracker.split(/[()]+/);
      const input = sections[1];
      const cb = sections[0];
      const rId = `__mwc_${Random.id(10)}`;
      const obj = {
        _id: rId,
        cb,
      };
      mwcDeps[tracker] = obj;
      const _trObFn = function (...args) {
        const dep = obj;
        dep.dep = this.__mwcDeps[tracker].dep || new Tracker.Dependency();
        dep.args = args;
        this.__mwcDeps[tracker] = dep;
        this.__mwcDeps[tracker] = _.clone(this.__mwcDeps[tracker]);
        dep.dep.changed();
      };
      this[rId] = _trObFn;
      observers.push(`${rId}(${input})`);
    }
    this.observers = observers;
    this.__mwcDeps = mwcDeps;
  },
  attached() {
    this.__mwcFirstRun = true;
    for (const i of Object.keys(this.__mwcDeps)) {
      const obFn = () => {
        this.__mwcDeps[i].dep = this.__mwcDeps[i].dep || new Tracker.Dependency();
        const args = this.__mwcDeps[i].args || [];
        this.__mwcDeps[i].dep.depend();
        this[this.__mwcDeps[i].cb](...args);
        this.__mwcDeps = _.clone(this.__mwcDeps);
      };
      this.autorun(obFn.bind(this));
    }
    this.autorun(this.tracker);
    this.autorun(mwcDataUpdate.bind(null, this));
  },
  detached() {
    _.each(this.__mwcComputations, (c) => {
      c.stop();
    });
    this.__mwcComputations = [];
    this.__mwcHandles.forEach((h) => {
      h.stop();
    });
    this.__mwcBin.forEach((h) => {
      h.stop();
    });
  },
  _mwcPush(p, val) {
    const prop = _.clone(this[p]);
    prop.push(val);
    this.set(p, prop);
  },
  guard(f) {
    if (Meteor.isServer || !Tracker.currentComputation) {
      return f();
    }

    const dep = new Tracker.Dependency();
    dep.depend();

    let value;
    let newValue;
    Tracker.autorun((comp) => {
      newValue = f();
      if (!comp.firstRun && !EJSON.equals(newValue, value)) {
        dep.changed();
      }
      value = EJSON.clone(newValue);
    });
    return newValue;
  },
  autorun(f) {
    const cb = (c) => {
      if (!_.find(this.__mwcComputationsIds, _id => _id === c._id)) {
        this._mwcPush('__mwcComputationsIds', c._id);
        this._mwcPush('__mwcComputations', c);
      }
      f.bind(this)(c);
    };
    return Tracker.autorun(cb.bind(this));
  },
  _removeSubs(val) {
    const handles = _.reject(_.clone(this.__mwcHandles), (h) => {
      if (h.subscriptionId === val.subscriptionId) {
        return true;
      }
      return false;
    });
    this._mwcPush('__mwcBin', val);
    this.set('__mwcHandles', handles);
  },
  subscribe(...args) {
    const handle = Meteor.subscribe.apply(null, args);
    this._mwcPush('__mwcHandles', handle);
    this._subsReady();
    const afterSub = (c) => {
      if (handle.ready()) {
        this._removeSubs(handle);
        this._subsReady();
        c.stop();
      }
    };
    this.autorun(afterSub.bind(this));
    return handle;
  },
  _subsReady() {
    const isReady = _.every(this.__mwcHandles, sub => sub && sub.ready());
    this.set('subsReady', isReady);
    return isReady;
  },
  getMeteorData() {
  },
  tracker() {
  },
};

