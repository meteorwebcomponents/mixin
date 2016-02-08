mwcMixin = {

  properties: {
    mwcData:{type:Object}
  },

  ready:function(){
  },
  setData:function(data){
    this.set("mwcData",data);
  },
  attached: function() {
    var self = this;

    self._mwcStateDep = new Tracker.Dependency();
    self._mwcFirstRun = true;

    Tracker.autorun(function(computation) {
      self._mwcComputation = computation;
      self._mwcStateDep.depend();

      if (self.mwcSubscribe) {
        console.warn("mwcSubscribe is deprecated. Subscribe inside getMeteorData. https://github.com/meteorwebcomponents/mixin/blob/master/README.md");
        self.mwcSubscribe();
      }

      mwcDataUpdate(self);
    });
  },
  detatched:function(){
    if (this._mwcComputation) {
      this._mwcComputation.stop();
      this._mwcComputation = null;
    }

  }
};

function mwcDataUpdate(element) {
  var partialState =
    element.getMeteorData &&
    element.getMeteorData();

  if (! partialState) {
    return;
  }

  if (element._mwcFirstRun) {
    element._mwcFirstRun = false;
    element._mwcCalledSetData = true;
    element.setData(partialState);
    return;
  }

  Tracker.afterFlush(function() {
    element._mwcCalledSetData = true;
    element.setData(partialState);
  });
}

