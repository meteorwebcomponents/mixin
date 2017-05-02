import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { EJSON } from 'meteor/ejson';
import { Random } from 'meteor/random';

const mwcDataUpdate = (element) => {
  const el = element;
  const data = element.getMeteorData();

  if (!data) {
    return;
  }

  if (el.__mwcFirstRun) {
    el.__mwcFirstRun = false;
    el._mwcSetData(data);
    return;
  }

  Tracker.afterFlush(() => {
    el._mwcSetData(data);
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
      const dep = new Tracker.Dependency();
      const _trObFn = function (...args) { // eslint-disable-line func-names
        const _obj = obj;
        _obj.args = args;
        this.__mwcDeps[tracker] = _obj;
        this.__mwcDeps[tracker] = _.clone(this.__mwcDeps[tracker]);
        this.__mwcDeps = _.clone(this.__mwcDeps);
        dep.changed();
      };
      const obFn = function () { // eslint-disable-line func-names
        const _obj = this.__mwcDeps[tracker];
        const args = _obj.args || [];
        dep.depend();
        this[_obj.cb](...args);
      };
      obj.obFn = obFn;
      mwcDeps[tracker] = obj;

      this[rId] = _trObFn;
      this._createMethodObserver(`${rId}(${input})`);
    }
    this.__mwcDeps = mwcDeps;
  },
  attached() {
    this.__mwcFirstRun = true;
    for (const tracker of Object.keys(this.__mwcDeps)) {
      const _obj = this.__mwcDeps[tracker];
      this.autorun(_obj.obFn.bind(this));
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
