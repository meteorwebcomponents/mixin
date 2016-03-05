<!--
  Title: Meteor Webcomponents Mixin, for Meteor Polymer integration
  Description: Mixin for polymer/webcomponents in meteor.
  -->
# Mixin


## What is mwc mixin?

mwcMixin is a reactive meteor data source for polymer elements. It is inspired from meteor react packages. Objective is to use use the
reactive meteor collections inside polymer elements.

## How to use it ?


Add `mwc:mixin` package to your Meteor App. Add `mwcMixin` behavior to your component behaviors. ie. `behaviors:[mwcMixin]`

```sh
    $ meteor add mwc:mixin
```
Add mwcMixin behavior.

```js
     Polymer({
        is: "custom-elements",
        behaviors:[mwcMixin],

        getMeteorData: function() {
        Meteor.subscribe("collectionName");
          return {
            collectionName:collectionName.find(options).fetch()
          };
        }
      })
```

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
        Meteor.subscribe("userlist");
        this.set('userlist',Meteor.users.find().fetch());
        
        //setting property mwcData. collection can be accessed as mwcData.collectionName.
        Meteor.subscribe("post"); //all posts
        Meteor.subscribe("comment",{"post_id":postId}); //comments of the current post only.
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

[Advanced Example](https://github.com/HedCET/TorrentAlert)

##Related Projects

[MWC Compiler](https://github.com/meteorwebcomponents/compiler) - Compiler for polymer/webcomponents in meteor.

[MWC Router](https://github.com/meteorwebcomponents/router) - Reactive routing for polymer/webcomponents in meteor.

[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer

[mwc flowrouter demo](https://github.com/meteorwebcomponents/demo-flowrouter) - mwc demo with flowrouter as the default router
