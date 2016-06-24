mwcMixin = {

  properties: {
    subsReady:{type:Boolean,notify:true,value:true},

    mwcData:Object,
    __handles:{type:Array,value:[]},
    __computations:{type:Array,value:[]},
    __computationsIds:{type:Array,value:[]},
    __mwcBin:{type:Array,value:[]}
  },
  setData(data){
    this.set("mwcData",data);
  },
  attached() {
    this.__mwcFirstRun = true;
    this.autorun(this.tracker);
    this.autorun(mwcDataUpdate.bind(null,this));
  },
  detatched() {
    _.each(this.__computations,(c)=>{
      c.stop();
    });
    this.__computations = [];
    this.__handles.forEach((h)=>{
      h.stop();
    });
    this.__mwcBin.forEach((h)=>{
      h.stop();
    });

  },
  cPush(p,val) {
    let prop = _.clone(this[p]);
    prop.push(val);
    this.set(p,prop);
  },
  guard(f) {
    if (Meteor.isServer || !Tracker.currentComputation) {
      return f();
    }

    let dep = new Tracker.Dependency()
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
      if(!_.find(this.__computationsIds,(_id)=>{
        return _id == c._id;
      })){
        this.cPush("__computationsIds",c._id);
        this.cPush("__computations",c);
      }
      f.bind(this)(c);
    }
    Tracker.autorun(cb.bind(this));

  },
  _removeSubs(val){
    const handles = _.reject(_.clone(this.__handles),(h)=>{
      if(h.subscriptionId = val.subscriptionId){
        return true;
      }
    });
    this.cPush('__mwcBin',val);
    this.set("__handles",handles);

  },
  subscribe() {
    const handle = Meteor.subscribe.apply(null,arguments);
    this.cPush("__handles",handle);
    this._subsReady();
    const afterSub = (c)=>{
      if (handle.ready()) {
        this._removeSubs(handle);
        this._subsReady();
        c.stop();

      }
    }
    this.autorun(afterSub.bind(this));

    return handle;
  },
  _subsReady(__h) {
    const isReady =  _.every(this.__handles, (sub)=> {
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
    element.setData(data);
    return;
  }

  Tracker.afterFlush(()=> {
    element.setData(data);
  });
}

