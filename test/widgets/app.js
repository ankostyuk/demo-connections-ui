/**
 * @module connections widgets test
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

                            require('bootstrap');

    var angularModules = [
        require('np.l10n/np.l10n'),
        require('np.directives'),
        require('np.utils'),
        require('nkb.user'),
        require('./test')
    ];
    //

    var app = angular.module('app', _.pluck(angularModules, 'name'))
        //
        .constant('appConfig', {
            resource: {
                // connections
                'list.create.url':          '/connections/api/list',
                'lists.url':                '/connections/api/lists',

                'list.entry.create.url':    '/connections/api/list/{{listId}}/entry',

                'nodes.lists.url':          '/connections/api/nodes/lists'
            }
        })
        //
        .constant('nkbUserConfig', {
            resource: {
                'users.url':    '/siteapp/api/users'
            }
        })
        //
        .constant('angularMomentConfig', {
            timezone: 'Europe/Moscow'
        })
        //
        .config(['$logProvider', function($logProvider){
            $logProvider.debugEnabled(true);
        }])
        //
        .run(['$log', '$rootScope', '$window', '$q', 'npL10n', 'nkbUser', 'widgetsTestHelper', function($log, $rootScope, $window, $q, npL10n, nkbUser, widgetsTestHelper){
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
            $q.all([nkbUser.initPromise()]).then(function(){
                $rootScope.app.ready = true;

                widgetsTestHelper.initTestData();
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
