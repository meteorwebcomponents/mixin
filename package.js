Package.describe({
  name: 'mwc:mixin',
  version: '1.0.0',
  summary: 'Reactive Data Mixin For Polymer',
    git: "https://github.com/meteorwebcomponents/mixin.git",
  documentation: null
});

Package.onUse(function(api) {
     api.versionsFrom("1.0");

    api.addFiles("mwc-mixin.js", ["client"]);

    api.export("mwcMixin");
});


