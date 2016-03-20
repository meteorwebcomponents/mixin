<!--
  Title: Meteor Webcomponents Mixin, for Meteor Polymer integration
  Description: Mixin for polymer/webcomponents in meteor.
  -->
# Mixin


## What is mwc mixin?

mwcMixin is a reactive meteor data source for polymer elements. It is inspired from meteor react packages. Objective is to use use the
reactive meteor collections inside polymer elements.

## Installation

### Method 1 - Meteor Package
Add `mwc:mixin` package to your Meteor App. Add `mwcMixin` behavior to your component behaviors. ie. `behaviors:[mwcMixin]`

```sh
    $ meteor add mwc:mixin
```
### Method 2 - Using bower

```sh
bower install mwc-mixin --save
```
import mwc-mixin.html file.

## How to use it ?

Add mwcMixin behavior.

```js
     Polymer({
        is: "custom-elements",
        behaviors:[mwcMixin],

        getMeteorData: function() {
        this.subscribe("collectionName");
          return {
            collectionName:collectionName.find(options).fetch()
          };
        }
      })
```

`this.subsReady` changes to `true` when your subscription is complete.

`this.mwcData` contains collections which are reactive. Use it as
`{{mwcData.collectionName}}`

### With FlowRouter and `mwc:layout`

```js
//Router
FlowRouter.route("/post/:_id", {
    name: 'post-view',
    action: function(params, queryParams) {
        mwcLayout.render('main', {
            "main": "post-view"
        });
    }
});

// Inside post-view element

Polymer({
    is: "post-view",
    behaviors:[mwcMixin], /***** IMPORTANT *****/
    properties:{userlist:{type:Object}},

    getMeteorData: function() {
        
        var postId = FlowRouter.getParam('_id'); // getParam is reactive.
        
        //setting properties
        this.subscribe("userlist");
        this.set('userlist',Meteor.users.find().fetch());
        
        //setting property mwcData. collection can be accessed as mwcData.collectionName.
        this.subscribe("post"); //all posts
        this.subscribe("comment",{"post_id":postId}); //comments of the current post only.
        // return object is set as this.mwcData¬
        return {
            post: post.find({
                "_id":postId
            }).fetch(),
            comment: comment.find().fetch()
        };
    }
});

```

```html

...

<template is="dom-if" if="{{!subsReady}}">
Loading Subscriptions..
</template>

...

```

[Advanced Example](https://github.com/HedCET/TorrentAlert)

##Related Projects

[MWC Compiler](https://github.com/meteorwebcomponents/compiler) - Compiler for polymer/webcomponents in meteor.

[MWC Router](https://github.com/meteorwebcomponents/router) - Reactive routing for polymer/webcomponents in meteor.

[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer

[mwc flowrouter demo](https://github.com/meteorwebcomponents/demo-flowrouter) - mwc demo with flowrouter as the default router
