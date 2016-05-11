/**
 * @module np.connections.lists.resource
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
    return angular.module('np.connections.lists.resource', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsListsResource', ['$log', '$interpolate', 'appConfig', 'npResource', function($log, $interpolate, appConfig, npResource){

            var config = appConfig.resource || {};

            // API
            return {

                lists: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['lists.url']
                    }, null, options);
                },

                listEntries: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: $interpolate(config['list.entries.url'])({
                            id: options.id
                        })
                    }, null, options);
                }
            };
        }]);
    //
});
