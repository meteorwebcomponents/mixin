'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _tracker2 = require('meteor/tracker');

var _underscore = require('meteor/underscore');

var _ejson = require('meteor/ejson');

var _random = require('meteor/random');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mwcDataUpdate = function mwcDataUpdate(element) {
  var el = element;
  var data = element.getMeteorData();

  if (!data) {
    return;
  }

  if (el.__mwcFirstRun) {
    el.__mwcFirstRun = false;
    el._mwcSetData(data);
    return;
  }

  _tracker2.Tracker.afterFlush(function () {
    el._mwcSetData(data);
  });
};

MwcMixin = function MwcMixin(parent) {
  return function (_parent) {
    _inherits(_class, _parent);

    function _class() {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

      var mwcDeps = {};
      var trackers = _this.trackers || [];

      var _loop = function _loop(i) {
        var tracker = trackers[i];
        var sections = tracker.split(/[()]+/);
        var input = sections[1];
        var cb = sections[0];
        var rId = '__mwc_' + _random.Random.id(10);
        var obj = {
          _id: rId,
          cb: cb
        };
        var dep = new _tracker2.Tracker.Dependency();
        var _trObFn = function _trObFn() {
          // eslint-disable-line func-names
          var _obj = obj;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _obj.args = args;
          this.__mwcDeps[tracker] = _obj;
          this.__mwcDeps[tracker] = _underscore._.clone(this.__mwcDeps[tracker]);
          this.__mwcDeps = _underscore._.clone(this.__mwcDeps);
          dep.changed();
        };
        var obFn = function obFn() {
          // eslint-disable-line func-names
          var _obj = this.__mwcDeps[tracker];
          var args = _obj.args || [];
          dep.depend();
          this[_obj.cb].apply(this, _toConsumableArray(args));
        };
        obj.obFn = obFn;
        mwcDeps[tracker] = obj;

        _this[rId] = _trObFn;
        _this._createMethodObserver(rId + '(' + input + ')');
      };

      for (var i = 0; i < trackers.length; i += 1) {
        _loop(i);
      }
      _this.__mwcDeps = mwcDeps;
      return _this;
    }

    _createClass(_class, [{
      key: '_mwcSetData',
      value: function _mwcSetData(data) {
        this.set('mwcData', data);
      }
    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'connectedCallback', this).call(this);
        this.__mwcFirstRun = true;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this.__mwcDeps)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _tracker = _step.value;

            var _obj = this.__mwcDeps[_tracker];
            this.autorun(_obj.obFn.bind(this));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.autorun(this.tracker);
        this.autorun(mwcDataUpdate.bind(null, this));
      }
    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        _get(_class.prototype.__proto__ || Object.getPrototypeOf(_class.prototype), 'disconnectedCallback', this).call(this);
        _underscore._.each(this.__mwcComputations, function (c) {
          c.stop();
        });
        this.__mwcComputations = [];
        this.__mwcHandles.forEach(function (h) {
          h.stop();
        });
        this.__mwcBin.forEach(function (h) {
          h.stop();
        });
      }
    }, {
      key: '_mwcPush',
      value: function _mwcPush(p, val) {
        var prop = _underscore._.clone(this[p]);
        prop.push(val);
        this.set(p, prop);
      }
    }, {
      key: 'guard',
      value: function guard(f) {
        if (Meteor.isServer || !_tracker2.Tracker.currentComputation) {
          return f();
        }

        var dep = new _tracker2.Tracker.Dependency();
        dep.depend();

        var value = void 0;
        var newValue = void 0;
        _tracker2.Tracker.autorun(function (comp) {
          newValue = f();
          if (!comp.firstRun && !_ejson.EJSON.equals(newValue, value)) {
            dep.changed();
          }
          value = _ejson.EJSON.clone(newValue);
        });
        return newValue;
      }
    }, {
      key: 'autorun',
      value: function autorun(f) {
        var _this2 = this;

        var cb = function cb(c) {
          if (!_underscore._.find(_this2.__mwcComputationsIds, function (_id) {
            return _id === c._id;
          })) {
            _this2._mwcPush('__mwcComputationsIds', c._id);
            _this2._mwcPush('__mwcComputations', c);
          }
          f.bind(_this2)(c);
        };
        return _tracker2.Tracker.autorun(cb.bind(this));
      }
    }, {
      key: '_removeSubs',
      value: function _removeSubs(val) {
        var handles = _underscore._.reject(_underscore._.clone(this.__mwcHandles), function (h) {
          if (h.subscriptionId === val.subscriptionId) {
            return true;
          }
          return false;
        });
        this._mwcPush('__mwcBin', val);
        this.set('__mwcHandles', handles);
      }
    }, {
      key: 'subscribe',
      value: function subscribe() {
        var _this3 = this;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var handle = Meteor.subscribe.apply(null, args);
        this._mwcPush('__mwcHandles', handle);
        this._subsReady();
        var afterSub = function afterSub(c) {
          if (handle.ready()) {
            _this3._removeSubs(handle);
            _this3._subsReady();
            c.stop();
          }
        };
        this.autorun(afterSub.bind(this));
        return handle;
      }
    }, {
      key: '_subsReady',
      value: function _subsReady() {
        var isReady = _underscore._.every(this.__mwcHandles, function (sub) {
          return sub && sub.ready();
        });
        this.set('subsReady', isReady);
        return isReady;
      }
    }, {
      key: 'getMeteorData',
      value: function getMeteorData() {}
    }, {
      key: 'tracker',
      value: function tracker() {}
    }], [{
      key: 'properties',
      get: function get() {
        return {
          subsReady: { type: Boolean, notify: true, value: true },
          mwcData: Object,
          __mwcHandles: { type: Array, value: [] },
          __mwcPush: { type: Array, value: [] },
          __mwcComputations: { type: Array, value: [] },
          __mwcComputationsIds: { type: Array, value: [] },
          __mwcBin: { type: Array, value: [] }
        };
      }
    }]);

    return _class;
  }(parent);
};

if (typeof window !== "undefined") {
  window.MwcMixin = MwcMixin;
}