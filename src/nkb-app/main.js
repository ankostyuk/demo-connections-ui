var root = this;

/*
 * config
 *
 */
// i18n
var i18nBundles = [
    // external
    'text!external_components/nullpointer-rsearch/l10n/ui/bundle.json',
    'text!external_components/nullpointer-rsearch/l10n/ui_keys/bundle.json',
    'text!external_components/nullpointer-rsearch/l10n/okato_region/bundle.json',
    // internal
    'text!src/l10n/ui/bundle.json',
    'text!src/l10n/ui_keys/bundle.json'
];

//
root._APP_CONFIG = {
    lang: {
        defaultLang: 'ru',
        langs: ['ru', 'en']
    },
    meta: {
    }
};

//
root._RESOURCES_CONFIG = {
    baseUrl: '/connections-ui',

    paths: {
        'angular':              'external_components/angular/angular',
        'angular-mocks':        'external_components/angular-mocks/angular-mocks',
        'angular-locale_ru':    'external_components/angular-i18n/angular-locale_ru',
        'angular-locale_en':    'external_components/angular-i18n/angular-locale_en',
        'ng-infinite-scroll':   'external_components/ngInfiniteScroll/ng-infinite-scroll',

        'jquery':               'external_components/jquery/jquery',
        'jquery.cookie':        'external_components/jquery.cookie/jquery.cookie',

        'bootstrap':            'external_components/bootstrap/js/bootstrap',

        'purl':                 'external_components/purl/purl',
        'session':              'external_components/session.js/session',

        'moment':               'external_components/moment/moment',
        'moment-timezone':      'external_components/moment-timezone/moment-timezone-with-data',
        'angular-moment':       'external_components/angular-moment/angular-moment'
    },

    packages: [{
        name: 'app',
        location: 'src/nkb-app',
        main: 'app'
    }, {
        name: 'connections',
        location: 'src/connections',
        main: 'connections'
    },
    // test
    {
        name: 'test',
        location: 'test',
        main: 'test'
    },
    // external packages
    {
        name: 'app.login',
        location: 'external_components/nullpointer-rsearch/nkb-app/components/login',
        main: 'login'
    }, {
        name: 'app.lang',
        location: 'external_components/nullpointer-rsearch/nkb-app/components/lang',
        main: 'lang'
    }, {
        name: 'lodash',
        location: 'external_components/nullpointer-commons/lodash'
    }, {
        name: 'commons-utils',
        location: 'external_components/nullpointer-commons/utils',
        main: 'utils'
    }, {
        name: 'nkb.user',
        location: 'external_components/nullpointer-commons/nkb/user',
        main: 'user'
    }, {
        name: 'nkb.icons',
        location: 'external_components/nullpointer-commons/nkb/icons',
        main: 'icons'
    }, {
        name: 'nkb.filters',
        location: 'external_components/nullpointer-commons/nkb/filters',
        main: 'filters'
    }, {
        name: 'np.directives',
        location: 'external_components/nullpointer-commons/angular/directives',
        main: 'directives'
    }, {
        name: 'np.filters',
        location: 'external_components/nullpointer-commons/angular/filters',
        main: 'filters'
    }, {
        name: 'np.l10n',
        location: 'external_components/nullpointer-commons/angular/l10n',
        main: 'l10n'
    }, {
        name: 'np.resource',
        location: 'external_components/nullpointer-commons/angular/resource',
        main: 'resource'
    }, {
        name: 'np.utils',
        location: 'external_components/nullpointer-commons/angular/utils',
        main: 'utils'
    }, {
        name: 'template-utils',
        location: 'external_components/nullpointer-commons/utils/template-utils',
        main: 'template-utils'
    }, {
        name: 'i18n',
        location: 'external_components/nullpointer-i18n',
        main: 'i18n'
    },
    // TODO https://github.com/newpointer/connections-ui/issues/6
    {
        name: 'autokad',
        location: 'external_components/nullpointer-autokad/autokad',
        main: 'autokad'
    }, {
        name: 'nkb.extraneous',
        location: 'external_components/nullpointer-rsearch/extraneous'
    }, {
        name: 'nullpointer-rsearch',
        location: 'external_components/nullpointer-rsearch'
        // location: '/rsearch/src'
    }],

    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-mocks': {
            deps: ['angular']
        },
        'ng-infinite-scroll': {
            deps: ['angular']
        },
        'jquery.cookie': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        }
    },

    config: {
        'np.l10n/l10n': {
            lang: root._APP_CONFIG.lang,
            'i18n-component': {
                // Должны отличаться от общих настроек шаблонизатора,
                // т.к. смысл шаблонизации i18n:
                //   только перевести текст шаблона,
                //   а далее использовать переведённый шаблон с шаблонизатором по умолчанию
                templateSettings: {
                    evaluate:       '',
                    interpolate:    /\$\{([\s\S]+?)\}/g,
                    escape:         ''
                },
                escape: false
            },
            bundles: i18nBundles
        }
    },

    modules: [{
        name: 'app/main',
        include: [
            // locales
            'text!angular-locale_ru.js',
            'text!angular-locale_en.js'
        ].concat(i18nBundles)
    }],

    map: {
        '*': {
            'css': 'external_components/require-css/css',
            'less': 'external_components/require-less/less',
            'text': 'external_components/requirejs-text/text'
        }
    },

    less: {
        relativeUrls: true
    },

    urlArgs: new Date().getTime()
};

/*
 * init
 *
 */
if (typeof define === 'function' && define.amd) {
    requirejs.config(root._RESOURCES_CONFIG);

    require(['app'], function(app){
        // init app
        app.init(document);
    });
}
