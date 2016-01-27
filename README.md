# Mixin


## What is mwc mixin?

mwcMixin is a reactive meteor data source for polymer elements. It is inspired from meteor react packages. Objective is to use use the
reactive meteor collections inside polymer elements.

## How to use it ?


Add `mwc:mixin` package to your Meteor App 


```sh
    $ meteor add mwc:mixin
```
Add mwcMixin behavior.

```js
     Polymer({
        is: "task-items",
        properties: {
        },
        behaviors:[mwcMixin],
   
        mwcSubscribe: function() {
          Meteor.subscribe("collectionName");
        },

        getMeteorData: function() {
          return {
            collectionName:collectionName.find(options).fetch()
          };
        }
      })
```

`this.mwcData` contains collections which are reactive. Use it as
`{{mwcData.collectionName}}`
