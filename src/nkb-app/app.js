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
                'meta.url':                 '/nkbrelation/api/meta',
                'relation-ui.report.url':   '/nkbrelation/report',

                // connections
                'list.create.url':          '/connections/api/list',
                'list.url':                 '/connections/api/list/{{id}}',
                'lists.url':                '/connections/api/lists',

                'list.entry.create.url':    '/connections/api/list/{{listId}}/entry',
                'list.entry.url':           '/connections/api/list/{{listId}}/entry/{{entryId}}',
                'list.entries.url':         '/connections/api/list/{{id}}/entries',

                'order.create.url':         '/connections/api/order',
                'order.url':                '/connections/api/order/{{id}}',
                'orders.url':               '/connections/api/orders',
                'orders.state.url':         '/connections/api/orders/state',
                'orders.view.url':          '/connections/api/orders/view',

                // push
                'push.url':                 '/connections/stomp',
                'push.orders.state.url':    '/user/queue/order'
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
        .run(['$log', '$rootScope', '$window', '$q', 'npL10n', 'nkbUser', 'npRsearchMetaHelper', function($log, $rootScope, $window, $q, npL10n, nkbUser, npRsearchMetaHelper){
            //
            _.extend($rootScope, {
                app: {
                    ready: false
                },
                isAppReady: function() {
                    return $rootScope.app.ready;
                }
            });

            //
            Commons.DOMUtils.window().bind('beforeunload', function() {
                if ($window.APP_BUILD_TYPE === 'production') {
                    return _tr("Текущий сеанс работы с приложением будет завершён");
                }
            });

            //
            $q.all([nkbUser.initPromise(), npRsearchMetaHelper.initPromise()]).then(function(){
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
