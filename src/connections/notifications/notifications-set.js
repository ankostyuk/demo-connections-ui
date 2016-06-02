/**
 * @module np.connections.notifications-set
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.notifications-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNotificationsSet', ['$log', '$rootScope', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me = this;
            };
        }]);
    //
});
