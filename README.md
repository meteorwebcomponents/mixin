<!--
  Title: Meteor Webcomponents Mixin, for Meteor Polymer integration
  Description: Mixin for polymer/webcomponents in meteor.
  -->
# Mixin

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/aruntk/meteorwebcomponents?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Polymer 1.x users refer https://github.com/meteorwebcomponents/mixin/tree/1.x

## What is mwc mixin?

MwcMixin is a reactive meteor data source for polymer elements. Objective is to use use the reactive meteor collections/variables inside polymer elements.

## Installation

### Method 1 - Meteor Package
Add `mwc:mixin` package to your Meteor App.

```sh
meteor add mwc:mixin@2.0.0

```
### Method 2 - Using bower

```sh
bower install mwc-mixin#2.0.0 --save
```
import mwc-mixin.html file.



## How to use it ?

Use `MwcMixin` to extend your class
```js

import { MwcMixin } from 'meteor/mwc:mixin' // disable if mixin is added using bower
class MyElement extends MwcMixin(Polymer.Element){
  constructor() {
    super(); // important
  }
  static get is() { return "my-element" }
  connectedCallback() {
    super.connectedCallback(); // important
  }
...
}
```

If you have hybrid components as well use mixin version 1.x and use as 

> Note that in mixin 1.x behavior name is mwcMixin. In 2.x I've changed it to MwcMixin (since its a class name).

```js
// for polymer v2 elements

class MyElement extends Polymer.mixinBehaviors([MyBehavior, mwcMixin], Polymer.Element) {
...
```


```js
// hybrid elements

Polymer({
  is: 'my-element',
  behaviors: [MyBehavior, mwcMixin],
...
});


```
### Trackers

Trackers are polymer observers with meteor's reactivity.
observers defined in trackers array get rerun when
1. Observing properties change.
2. Reactive data inside function change.

```js
import { MwcMixin } from 'meteor/mwc:mixin' // disable if mixin is added using bower
class MyElement extends MwcMixin(Polymer.Element){
  constructor() {
    super(); // important
  }
  static get is() { return "my-element" }
  connectedCallback() {
    super.connectedCallback(); // important
    this.propA = "Meteor Status is "
  }
  static get properties() {
    return { propA:String };
  }
  get trackers() {
    { return ["changeStatus(propA)"] };
  }
  changeStatus:function(p){
    console.log(p,Meteor.status().status); // runs every time propA/meteor status changes.
  }
};
window.customElements.define(MyElement.is, MyElement);
```

### Methods

#### tracker

mwcMixin tracker runs first while attaching element and gets destroyed when the element gets detatched. Its just like executing something inside a Meteor tracker. You can set this.anyProperty reactively.

```js
import { MwcMixin } from 'meteor/mwc:mixin' // disable if mixin is added using bower

class MyElement extends MwcMixin(Polymer.Element){
  constructor() {
    super(); // important
  }
  static get is() { return "my-element" }
  connectedCallback() {
    super.connectedCallback(); // important
    this.propA = "Meteor Status is "
  }
  static get properties() {
    return { status: String };
  }
  tracker(){
    this.status = Meteor.status().status; //runs every time status changes.
  }
};
```
```html
...
<template>
  status : [[status]]
</template>
...
```



#### autorun

Simple tracker autorun with computations stored in __computation property. Use this to use Meteor reactivity outside tracker method(tracker method runs first when attached).

```js
this.autorun(function(){console.log(FlowRouter.getParam('param'))});
```

#### guard

Guard limits reactivity. It triggers the enclosing computation only if the return variable changes.

In the following example tracker gets triggered only if return object changes. Which mean if p == false then tracker method will not be triggered even if qp changes. So no unwanted subscription calls in the example.
  
```js
  ...
  tracker(){
    const data = this.guard( params => {
      const p = FlowRouter.getParam('p');
      const qp = FlowRouter.getQueryParam('qp');
      return p ? { p: p, qp: qp } : {} ;
    }); // data changes only if p changes. thus limits reactivity.
    this.subscribe('sd_data', data);
  }
  ...
```


#### subscribe

This is similar to Blaze's template level subscriptions.
All subscription handles can be find in __handles property until they are ready. When they are ready handles are pushed to __mwcBin property.
All subscriptions are stopped when the components gets detatched
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
import { MwcMixin } from 'meteor/mwc:mixin' // disable if mixin is added using bower

class MyElement extends MwcMixin(Polymer.Element){
  constructor() {
    super(); // important
  }
  static get is() { return "my-element" }
  connectedCallback() {
    super.connectedCallback(); // important
  }
  getMeteorData(){
    return {status :  Meteor.status().status}; //runs every time status changes.
  }
};

```
```html
...
<template>
  status : [[mwcData.status]]
</template>
...
```



### Examples

[MWC App Route Demo](https://github.com/aruntk/kickstart-meteor-polymer-with-app-route/tree/2.0-preview) - mwc demo with polymer app route as the default router.

### Like it?

:star: this repo

### Found a bug?

Raise an issue!

### Related Projects

[MWC Synthesis](https://github.com/meteorwebcomponents/synthesis) - Compiler for polymer/webcomponents in meteor.

[MWC Router](https://github.com/meteorwebcomponents/router) - Reactive routing for polymer/webcomponents in meteor.

[MWC Layout](https://github.com/meteorwebcomponents/layout) - polymer layout renderer

[MWC Flowrouter Demo](https://github.com/aruntk/kickstart-meteor-polymer) - mwc demo with flowrouter as the default router



