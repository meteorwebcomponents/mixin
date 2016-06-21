Package.describe({
  name: 'mwc:mixin',
  version: '1.0.18',
  summary: 'Reactive Data Mixin For Polymer',
  git: "https://github.com/meteorwebcomponents/mixin.git",
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.2");
  api.use('ecmascript');

  api.addFiles("mwc-mixin.js", ["client"]);

  api.export("mwcMixin");
});


