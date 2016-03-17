mwcMixin = {

  properties: {
    subsReady:{type:Boolean,value:false},
    mwcData:{type:Object}
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
    self.__mwcStateDep.depend();
    self.set("subsReady",false);
    var handle = Meteor.subscribe.apply(null,arguments);
    self.__handles.push(handle);
    var subsReady = function() {
      var isReady =  _.every(self.__handles, function(sub) {
        return sub && sub.ready();
      });

      return isReady;
    };
    Tracker.autorun(function(c) {
      if (subsReady()) {
        self.set("subsReady",true);
        c.stop();
      }
    });
    return handle;
  },
  getMeteorData:function(){
  },
  __handles:[]
};

function mwcDataUpdate(element) {
  var data = element.getMeteorData();

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

