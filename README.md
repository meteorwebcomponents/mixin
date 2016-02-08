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
        is: "custom-elements",
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
    behaviors:[mwcMixin],
    mwcSubscribe: function() {
    var postId = FlowRouter.getParam('_id'); //reactive
    // Subscription : all posts. But comments of the current post only.
        Meteor.subscribe("post");
        Meteor.subscribe("comment",{"post_id":postId});
    },

    getMeteorData: function() {
        var postId = FlowRouter.getParam('_id');¬
        return {
            post: post.find({
                "_id":postId
            }).fetch(),
            comment: comment.find().fetch()
        };
    }
});

```

##Related Projects

[MWC Compiler](https://github.com/meteorwebcomponents/compiler) - Compiler for polymer/webcomponents in meteor.

[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer

[mwc flowrouter demo](https://github.com/meteorwebcomponents/demo-flowrouter) - mwc demo with flowrouter as the default router
