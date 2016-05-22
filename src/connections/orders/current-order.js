/**
 * @module np.connections.current-order
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
    return angular.module('np.connections.current-order', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsCurrentOrder', ['$log', '$rootScope', 'npConnectionsOrdersResource', function($log, $rootScope, npConnectionsOrdersResource){
            return function() {
            };
        }]);
    //
});
