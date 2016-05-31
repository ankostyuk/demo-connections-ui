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

                createOrder: function(options) {
                    return npResource.request({
                        method: 'POST',
                        url: config['order.create.url'],
                        data: options.data
                    }, null, options);
                },

                orders: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['orders.url']
                    }, null, options);
                },

                order: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: $interpolate(config['order.url'])({
                            id: options.id
                        })
                    }, null, options);
                },

                deleteOrders: function(options) {
                    return npResource.request({
                        method: 'DELETE',
                        url: config['orders.url'],
                        data: options.data
                    }, null, options);
                }
            };
        }]);
    //
});
