/**
 * @module np.connections.new-list
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
    return angular.module('np.connections.new-list', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNewList', ['$log', '$rootScope', 'npConnectionsListsResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsListsResource, npConnectionsUtils){
            return function() {
                var me              = this,
                    _createRequest  = null;

                me.info = {};

                me.isReady = function() {
                    return me.info.name && me.info.type;
                };

                me.addListEntriesProxy = {
                    addActionEnabled: false,
                    getListType: function() {
                        return me.info.type;
                    }
                };

                me.doCreateList = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        me.create(function(hasError, response){
                            var list = response.data;

                            if (hasError) {
                                done();
                            } else {
                                $rootScope.$emit('np-connections-new-list', list, done);
                            }
                        });
                    });
                };

                me.create = function(callback) {
                    _createRequest = npConnectionsListsResource.createList({
                        data: me.info,
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _createRequest
                    });

                    function done(hasError, data) {
                        if (_.isFunction(callback)) {
                            callback(hasError, data);
                        }
                    }
                };

                me.reset = function() {
                    _.extend(me.info, {
                        name: null,
                        type: null
                    });
                };

                me.reset();
            };
        }]);
    //
});
