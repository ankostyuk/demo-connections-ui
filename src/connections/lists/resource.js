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
                        })
                    }, null, options);
                },

                lists: function(options) {
                    return npResource.request({
                        method: 'GET',
                        params: options.params,
                        url: config['lists.url']
                    }, null, options);
                },

                createListEntries: function(options) {
                    return npResource.request({
                        method: 'POST',
                        url: $interpolate(config['list.entry.create.url'])({
                            listId: options.listId
                        }),
                        data: options.data
                    }, null, options);
                },

                updateListEntry: function(options) {
                    return npResource.request({
                        method: 'PUT',
                        url: $interpolate(config['list.entry.url'])({
                            listId: options.listId,
                            entryId: options.entryId
                        }),
                        data: options.data
                    }, null, options);
                },

                listEntries: function(options) {
                    return npResource.request({
                        method: 'GET',
                        params: options.params,
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
                        data: options.data,
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    }, null, options);
                }
            };
        }]);
    //
});
