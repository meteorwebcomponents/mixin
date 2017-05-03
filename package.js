Package.describe({
  name: 'mwc:mixin',
  version: "2.0.0-beta.3",
  summary: 'Reactive Data Mixin For Polymer',
  git: 'https://github.com/meteorwebcomponents/mixin.git',
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');
  api.use('ejson');
  api.use('random');
  api.use('tracker');

  api.addFiles('src/mwc-mixin.js', ['client']);

  api.export('mwcMixin');
});
