mwcMixin = {

  properties: {
    subsReady:{type:Boolean,computed:"_subsReady(__handles)"},
    mwcData:Object,
    __handles:{type:Array,value:[]}
  },
  setData:function(data){
    this.set("mwcData",data);
  },
  attached: function() {
    var self = this;

    self.__mwcStateDep = new Tracker.Dependency();
    self.__mwcFirstRun = true;

    Tracker.autorun(function(c) {
      self.__mwcComputation = c;
      self.__mwcStateDep.depend();
      mwcDataUpdate(self);
    });
  },
  detatched:function(){
    if (this.__mwcComputation) {
      this.__mwcComputation.stop();
      this.__mwcComputation = null;
    }

  },
  subscribe:function(){
    self = this;
    var handle = Meteor.subscribe.apply(null,arguments);
    var handles = _.clone(self.__handles);
    handles.push(handle);
    self.set("__handles",handles);

    Tracker.autorun(function(c) {
      try{
        if (handle.ready()) {
          self.set("__handles",_.reject(_.clone(self.__handles),function(h){
            return h.subscriptionId = handle.subscriptionId;
          }));
          c.stop();
        }
      }
      catch(err){
        console.log(err);
      }

    });
    return handle;
  },
  _subsReady : function(__h) {
    var isReady =  _.every(__h, function(sub) {
      return sub && sub.ready();
    });

    return isReady;
  },

  getMeteorData:function(){
  },
  tracker:function(){
  
  }//
};

function mwcDataUpdate(element) {
  var data = element.getMeteorData();
element.tracker();
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

  Tracker.afterFlush(function() {
    element.setData(data);
  });
}

