/**
 * @module np.connections.orders.resource
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('np.resource')
    ];

    //
    return angular.module('np.connections.orders.resource', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsOrdersResource', ['$log', '$interpolate', 'appConfig', 'npResource', function($log, $interpolate, appConfig, npResource){

            var config = appConfig.resource || {};

            // API
            return {

                orders: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['orders.url']
                    }, null, options);
                }
            };
        }]);
    //
});
