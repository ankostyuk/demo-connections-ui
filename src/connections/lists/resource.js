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

                createList: function(options) {
                    return npResource.request({
                        method: 'POST',
                        url: config['list.create.url'],
                        data: options.data
                    }, null, options);
                },

                updateList: function(options) {
                    return npResource.request({
                        method: 'PUT',
                        url: $interpolate(config['list.url'])({
                            id: options.id
                        }),
                        data: options.data
                    }, null, options);
                },

                deleteList: function(options) {
                    return npResource.request({
                        method: 'DELETE',
                        url: $interpolate(config['list.url'])({
                            id: options.id
                        }),
                        data: options.data
                    }, null, options);
                },

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
                },

                deleteListEntries: function(options) {
                    return npResource.request({
                        method: 'DELETE',
                        url: $interpolate(config['list.entries.url'])({
                            id: options.id
                        }),
                        data: options.data
                    }, null, options);
                }
            };
        }]);
    //
});
