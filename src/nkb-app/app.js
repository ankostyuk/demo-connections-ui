/**
 * @module connections nkb-app
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
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

                            require('bootstrap');

    var angularModules = [
        require('angular-moment'),

        require('np.directives'),
        require('np.utils'),

        require('np.l10n/np.l10n'),
        require('app.login'),
        require('app.lang'),

        require('connections'),

        require('test')
    ];
    //

    var app = angular.module('app', _.pluck(angularModules, 'name'))
        //
        .constant('appConfig', {
            name: 'connections-ui',
            meta: root._APP_CONFIG.meta,
            yandexMetrikaCounterName: 'yaCounter23296318',
            resource: {
                'lists.url':                 '/connections/api/lists'
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
        .run(['$log', '$rootScope', 'npL10n', 'npUtils', function($log, $rootScope, npL10n, npUtils){
            //
            _.extend($rootScope, {
                app: {
                    ready: false
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                },
                loader: {}, // см. directive npLoader
                loading: function(operation) {
                    npUtils.loading(
                        operation,
                        function(){
                            $rootScope.loader.show();
                        },
                        function(){
                            $rootScope.loader.hide();
                        },
                    500);
                }
            });

            $rootScope.$on('nkb-user-apply', function(){
                $rootScope.app.ready = true;
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
