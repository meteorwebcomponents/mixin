mwcMixin = {

  properties: {
    subsReady:{type:Boolean,notify:true,value:true},

    mwcData:Object,
    __mwcHandles:{type:Array,value:[]},
    __mwcComputations:{type:Array,value:[]},
    __mwcComputationsIds:{type:Array,value:[]},
    __mwcBin:{type:Array,value:[]}
  },
  trackers:[],
  _mwcSetData(data){
    this.set("mwcData",data);
  },
  beforeRegister(){
    this.__mwcDeps = {};
    this.observers = this.observers || [];
    for(let i = 0;i < this.trackers.length;i++){
      const tracker = this.trackers[i];
      const sections = tracker.split(/[\(,\)]+/);
      const input =  sections[1];
      const cb = sections[0];
      const r_id = `__mwc_${Random.id(10)}`;
      const dep = new Tracker.Dependency();
      this.__mwcDeps[tracker] = {_id:r_id,dep:dep,cb:cb};
      this[r_id] = (...arg)=>{
        this.__mwcDeps[tracker].arg = arg;
        this.__mwcDeps[tracker].dep.changed();
      };

      this.observers.push(`${r_id}(${input})`);
    }
  },
  attached() {
    this.__mwcFirstRun = true;
    for(let i in this.__mwcDeps){
      const tracker = this.__mwcDeps[i];
      const obFn = (c)=>{
        tracker.dep.depend();
        this[tracker.cb].apply(this,tracker.arg);
      };
      this.autorun(obFn.bind(null,this));
    }
    this.autorun(this.tracker);
    this.autorun(mwcDataUpdate.bind(null,this));
  },
  detached() {
    for(let i in this.__mwcDeps){
      const tracker = this.__mwcDeps[i];
      delete this[tracker[`_id`]];
    }
    delete this.__mwcDeps;
    _.each(this.__mwcComputations,(c)=>{
      c.stop();
    });
    this.__mwcComputations = [];
    this.__mwcHandles.forEach((h)=>{
      h.stop();
    });
    this.__mwcBin.forEach((h)=>{
      h.stop();
    });

  },
  _mwcPush(p,val) {
    let prop = _.clone(this[p]);
    prop.push(val);
    this.set(p,prop);
  },
  guard(f) {
    if (Meteor.isServer || !Tracker.currentComputation) {
      return f();
    }

    let dep = new Tracker.Dependency();
    dep.depend();

    let value, newValue;
    Tracker.autorun(comp => {
      newValue = f();
      if (!comp.firstRun && !EJSON.equals(newValue, value)) {
        dep.changed();
      }
      value = EJSON.clone(newValue);
    });

    return newValue;

  },
  autorun(f){
    const cb = (c)=> {
      if(!_.find(this.__mwcComputationsIds,(_id)=>{
        return _id == c._id;
      })){
        this._mwcPush("__mwcComputationsIds",c._id);
        this._mwcPush("__mwcComputations",c);
      }
      f.bind(this)(c);
    };
    return Tracker.autorun(cb.bind(this));

  },
  _removeSubs(val){
    const handles = _.reject(_.clone(this.__mwcHandles),(h)=>{
      if(h.subscriptionId == val.subscriptionId){
        return true;
      }
    });
    this._mwcPush('__mwcBin',val);
    this.set("__mwcHandles",handles);

  },
  subscribe() {
    const handle = Meteor.subscribe.apply(null,arguments);
    this._mwcPush("__mwcHandles",handle);
    this._subsReady();
    const afterSub = (c)=>{
      if (handle.ready()) {
        this._removeSubs(handle);
        this._subsReady();
        c.stop();

      }
    };
    this.autorun(afterSub.bind(this));

    return handle;
  },
  _subsReady(h) {
    const isReady =  _.every(this.__mwcHandles, (sub)=> {
      return sub && sub.ready();
    });
    this.set("subsReady",isReady);
    return isReady;
  },

  getMeteorData(){
  },
  tracker(){

  }
};
const mwcDataUpdate = (element)=> {
  const data = element.getMeteorData();
  //  if(element.getMeteorData()){
  //  console.log("Use tracker instead of getMeteorData");
  //  }
  if (!data) {
    return;
  }

  if (element.__mwcFirstRun) {
    element.__mwcFirstRun = false;
    element._mwcSetData(data);
    return;
  }

  Tracker.afterFlush(()=> {
    element._mwcSetData(data);
  });
};

