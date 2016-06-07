<!--
  Title: Meteor Webcomponents Mixin, for Meteor Polymer integration
  Description: Mixin for polymer/webcomponents in meteor.
  -->
# Mixin


## What is mwc mixin?

mwcMixin is a reactive meteor data source for polymer elements. Objective is to use use the reactive meteor collections inside polymer elements.


## Installation

### Method 1 - Meteor Package
Add `mwc:mixin` package to your Meteor App.

```sh
meteor add mwc:mixin
```

### Method 2 - Using bower

```sh
bower install mwc-mixin --save
```
import mwc-mixin.html file.


## How to use it ?

Add `mwcMixin` behavior to your component behaviors. ie. `behaviors:[mwcMixin]`

```js
Polymer({
  is: "custom-elements",
  behaviors:[mwcMixin],
...
})
```

### Methods

#### tracker

mwcMixin tracker runs first while attaching element and gets destroyed when the element gets detatched. Its just like executing something inside a Meteor tracker. You can set this.anyProperty reactively.

```js
Polymer({
  is:"custom-element",
  behaviors:[mwcMixin],
  properties{
    status:String
  },
  tracker:function(){
    this.status = Meteor.status().status; //runs every time status changes.
  }

})
```
```html
...
<template>
  status : [[status]]
</template>
...
```

#### subscribe

This is similar to Blaze's template level subscriptions.
If you want to subscribe a collection from a polymer components use
```js
  this.subscribe("collectionName"); 
```

waiting for subscriptions to complete

`this.subsReady` changes to `true` when your subscription is complete.

```html

...

<template is="dom-if" if="{{!subsReady}}">
Loading Subscriptions..
</template>

...

```

#### getMeteorData

getMeteorData is tracker with one additional functionality. return value of the getMeteorData function gets set as mwcData. 

`this.mwcData` contains collections which are reactive. Use it as
`{{mwcData.collectionName}}`

```js
Polymer({
  is:"custom-element",
  behaviors:[mwcMixin],
  getMeteorData:function(){
    return {status :  Meteor.status().status}; //runs every time status changes.
  }

})

```
```html
...
<template>
  status : [[mwcData.status]]
</template>
...
```
### Examples

#### With FlowRouter and `mwc:layout`

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
    properties:{post:Object,comment:Object},

    tracker: function() {
        
        var postId = FlowRouter.getParam('_id'); // getParam is reactive.
        
        this.subscribe("post"); //all posts
        this.subscribe("comment",{"post_id":postId}); //comments of the current post only.
        
        this.set("post", post.find({
                "_id":postId
            }).fetch());
        this.set("comment",comment.find().fetch());
        };
    }
});

```
[Advanced Example](https://github.com/HedCET/TorrentAlert)

##Related Projects

[MWC Synthesis](https://github.com/meteorwebcomponents/synthesis) - Compiler for polymer/webcomponents in meteor.

[MWC Router](https://github.com/meteorwebcomponents/router) - Reactive routing for polymer/webcomponents in meteor.

[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer

[mwc flowrouter demo](https://github.com/aruntk/kickstart-meteor-polymer) - mwc demo with flowrouter as the default router

