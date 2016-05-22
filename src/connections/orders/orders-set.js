/**
 * @module np.connections.orders-set
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./resource')
    ];

    //
    return angular.module('np.connections.orders-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsOrdersSet', ['$log', '$rootScope', 'npConnectionsOrdersResource', function($log, $rootScope, npConnectionsOrdersResource){
            return function() {
            };
        }]);
    //
});
