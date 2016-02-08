Package.describe({
  name: 'mwc:mixin',
  version: '1.0.7',
  summary: 'Reactive Data Mixin For Polymer',
    git: "https://github.com/meteorwebcomponents/mixin.git",
  documentation: "README.md"
});

Package.onUse(function(api) {
     api.versionsFrom("1.0");

    api.addFiles("mwc-mixin.js", ["client"]);

    api.export("mwcMixin");
});


