//
var _       = require("lodash"),
    path    = require('path'),
    webapp  = require('nullpointer-web-app');

//
module.exports = function(grunt) {
    webapp.setBuildMeta({
        appId: 'connections-ui',
        APP_BUILD_TYPE: 'production',
        cwd: __dirname,
        name: 'nkb-app',
        rootpath: '/connections-ui/'
    });

    var gruntConfig = webapp.getDefaultGruntConfig(),
        buildMeta   = webapp.getBuildMeta();

    // extend copy
    _.set(gruntConfig, 'copy.dist.options.noProcess', '**/*.{ico,properties,js,gif}');
    _.get(gruntConfig, 'copy.dist.src').push('src/nkb-app/example-file-*.txt');

    // extend i18n
    _.set(gruntConfig, 'i18n.ui_keys.options', {
        mode:           'simple',
        pattern:        '**/*.txt',
        inputDir:       path.resolve(__dirname, 'i18n/ui_keys/src'),
        inputRootPath:  path.resolve(__dirname, ''),
        outputDir:      path.resolve(__dirname, 'i18n/ui_keys'),
        bundleDir:      path.resolve(__dirname, 'src/l10n/ui_keys'),
        baseLang:       buildMeta.langs[0],
        langs:          buildMeta.langs
    });

    webapp.initGrunt(grunt, gruntConfig);
};
