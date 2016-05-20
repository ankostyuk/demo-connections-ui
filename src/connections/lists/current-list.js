/**
 * @module np.connections.current-list
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
    return angular.module('np.connections.current-list', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsCurrentList', ['$log', '$rootScope', 'npConnectionsListsResource', function($log, $rootScope, npConnectionsListsResource){
            return function() {
                var me              = this,
                    _updateRequest  = null,
                    _deleteRequest  = null,
                    _entriesRequest = null,
                    _checked        = {};

                me.info = null;
                me.entries = null;

                me.getEntriesCount = function() {
                    return _.get(me.entries, 'total');
                };

                me.isEmpty = function() {
                    return !me.getEntriesCount();
                };

                me.remove = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        me.delete(function(hasError){
                            if (hasError) {
                                done();
                            } else {
                                $rootScope.$emit('np-connections-delete-list', me.info, done);
                            }
                        });
                    });
                };

                me.clean = function() {
                    $log.warn('* clean list');
                };

                me.removeCheckedEntries = function() {
                    $log.warn('* removeCheckedEntries...', _checked);
                };

                me.check = function(entry) {
                    entry.__checked = !entry.__checked;

                    if (entry.__checked) {
                        _checked[entry.id] = entry;
                    } else {
                        delete _checked[entry.id];
                    }
                };

                me.isChecked = function() {
                    return !_.isEmpty(_checked);
                };

                me.addListEntriesProxy = {
                    addActionEnabled: true,
                    getListType: function() {
                        return me.info.type;
                    }
                };

                me.inlineEditProxy = {
                    onEdit: function(newText, oldText, data) {
                        me.info.name = newText;

                        var updatedData = {
                            name: newText
                        };

                        $rootScope.$emit('np-connections-loading', function(done){
                            me.update(updatedData, function(hasError){
                                if (hasError) {
                                    me.info.name = oldText;
                                }
                                done();
                            });
                        });
                    }
                };

                me.setList = function(list) {
                    me.info = list;
                    resetEntries();
                };

                me.fetch = function(list, callback) {
                    me.info = list;
                    me.fetchEntries(callback);
                };

                me.update = function(updatedData, callback) {
                    _updateRequest = npConnectionsListsResource.updateList({
                        id: me.info.id,
                        data: updatedData,
                        success: function(data) {
                            done();
                        },
                        error: function() {
                            $rootScope.$emit('np-connections-error');
                            done(true);
                        },
                        previousRequest: _updateRequest
                    });

                    function done(hasError) {
                        if (_.isFunction(callback)) {
                            callback(hasError);
                        }
                    }
                };

                me.delete = function(callback) {
                    _deleteRequest = npConnectionsListsResource.deleteList({
                        id: me.info.id,
                        success: function(data) {
                            done();
                        },
                        error: function() {
                            $rootScope.$emit('np-connections-error');
                            done(true);
                        },
                        previousRequest: _deleteRequest
                    });

                    function done(hasError) {
                        if (_.isFunction(callback)) {
                            callback(hasError);
                        }
                    }
                };

                me.fetchEntries = function(callback) {
                    _entriesRequest = npConnectionsListsResource.listEntries({
                        id: me.info.id,
                        success: function(data) {
                            _.each(data.list, function(entry){
                                entry.__inlineEditProxy = {
                                    onEdit: function(newText, oldText, data) {
                                        $log.info('* list entry onEdit...', newText, oldText, entry);
                                        entry.userData = newText;
                                        // TODO
                                    }
                                };
                            });

                            me.entries = data;

                            done();
                        },
                        error: function() {
                            $rootScope.$emit('np-connections-error');
                            resetEntries();
                            done();
                        },
                        previousRequest: _entriesRequest
                    });

                    function done() {
                        if (_.isFunction(callback)) {
                            callback();
                        }
                    }
                };

                function resetEntries() {
                    me.entries = null;
                }
            };
        }]);
    //
});
