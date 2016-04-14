//
define(function(require) {'use strict';
    var root = window;

    //
                            require('jquery');
                            require('lodash');

    var angular           = require('angular'),
        l10n              = require('np.l10n');

                            require('nkb.icons');
                            require('css!../external_components/bootstrap/css/bootstrap');
                            require('less!./styles/app');

                            require('moment');
                            require('moment-timezone');

    var angularModules = {
        'angular-moment':   require('angular-moment'),

        'np.directives':    require('np.directives'),

        'np.l10n':          require('np.l10n/np.l10n'),
        login:              require('app.login'),
        lang:               require('app.lang')
    };

    var app = angular.module('app', _.pluck(angularModules, 'name'))
        //
        .constant('appConfig', {
            name: 'connections-ui',
            meta: root._APP_CONFIG.meta,
            yandexMetrikaCounterName: 'yaCounter23296318',
            resource: {
                // 'meta.url':                 '/nkbrelation/api/meta'
            }
        })
        //
        .constant('nkbUserConfig', {
            resource: {
                'users.url':    '/siteapp/api/users',
                'login.url':    '/siteapp/login',
                'logout.url':   '/siteapp/logout'
            }
        })
        //
        .constant('angularMomentConfig', {
            timezone: 'Europe/Moscow'
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(root.APP_BUILD_TYPE !== 'production');
        }])
        //
        .run(['$log', '$rootScope', 'npL10n', function($log, $rootScope, npL10n){
            //
            _.extend($rootScope, {
                app: {
                    ready: true
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });
        }]);
    //

    return {
        init: function(parent) {
            $(function() {
                l10n.initPromise.done(function(){
                    angular.bootstrap(parent, [app.name]);
                });
            });
        }
    };
});
