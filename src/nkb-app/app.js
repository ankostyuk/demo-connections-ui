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
        l10n              = require('np.l10n'),
        Commons           = require('commons-utils');

                            require('nkb.icons');
                            require('css!../external_components/bootstrap/css/bootstrap');
                            require('less!./styles/app');

                            require('moment');
                            require('moment-timezone');

                            require('bootstrap');

    var angularModules = [
        require('angular-moment'),

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
                'list.create.url':          '/connections/api/list',
                'list.url':                 '/connections/api/list/{{id}}',

                'lists.url':                '/connections/api/lists',
                // 'lists.url':                '/connections/api/list',

                'list.entry.create.url':    '/connections/api/list/{{listId}}/entry',
                'list.entries.url':         '/connections/api/list/{{id}}/entries',
                'order.create.url':         '/connections/api/order',

                'orders.url':               '/connections/api/orders'
                // 'orders.url':               '/connections/api/order'
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
        .run(['$log', '$rootScope', '$window', 'npL10n', function($log, $rootScope, $window, npL10n){
            //
            _.extend($rootScope, {
                app: {
                    ready: false
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });

            $rootScope.$on('nkb-user-apply', function(){
                $rootScope.app.ready = true;
            });

            //
            Commons.DOMUtils.window().bind('beforeunload', function() {
                if ($window.APP_BUILD_TYPE === 'production') {
                    return _tr("Текущий сеанс работы с приложением будет завершён");
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
