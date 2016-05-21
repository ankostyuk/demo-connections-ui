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
                var me                      = this,
                    _updateRequest          = null,
                    _deleteRequest          = null,
                    _entriesRequest         = null,
                    _deleteEntriesRequest   = null,
                    _checked                = {};

                me.info = null;
                me.entriesResult = null;
                me.entriesPage = null;

                me.getEntriesCount = function() {
                    return _.get(me.entriesPage, 'totalElements');
                };

                me.isEmpty = function() {
                    return !me.getEntriesCount();
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
                    me.doDeleteEntries(true);
                };

                me.removeCheckedEntries = function() {
                    me.doDeleteEntries(false);
                };

                me.doDeleteEntries = function(all) {
                    $rootScope.$emit('np-connections-loading', function(done){
                        var entryIds = all ? null : _.pluck(_checked, 'id');
                        me.deleteEntries(entryIds, function(hasError){
                            if (hasError) {
                                done();
                            } else {
                                resetChecked();
                                me.fetchEntries(done);
                            }
                        });
                    });
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
                            requestDone(false, data, callback);
                        },
                        error: function() {
                            requestDone(true, null, callback);
                        },
                        previousRequest: _updateRequest
                    });
                };

                me.delete = function(callback) {
                    _deleteRequest = npConnectionsListsResource.deleteList({
                        id: me.info.id,
                        success: function(data) {
                            requestDone(false, data, callback);
                        },
                        error: function() {
                            requestDone(true, null, callback);
                        },
                        previousRequest: _deleteRequest
                    });
                };

                me.fetchEntries = function(callback) {
                    resetChecked();

                    _entriesRequest = npConnectionsListsResource.listEntries({
                        id: me.info.id,
                        success: function(data) {
                            me.entriesResult = _.get(data, '_embedded');
                            me.entriesPage = _.get(data, 'page');

                            _.each(_.get(me.entriesResult, 'list'), function(entry){
                                entry.__inlineEditProxy = {
                                    onEdit: function(newText, oldText, data) {
                                        $log.info('* list entry onEdit...', newText, oldText, entry);
                                        entry.userData = newText;
                                        // TODO
                                    }
                                };
                            });

                            requestDone(false, data, callback);
                        },
                        error: function() {
                            resetEntries();
                            requestDone(true, null, callback);
                        },
                        previousRequest: _entriesRequest
                    });
                };

                me.deleteEntries = function(entryIds, callback) {
                    _deleteEntriesRequest = npConnectionsListsResource.deleteListEntries({
                        id: me.info.id,
                        data: entryIds || undefined,
                        success: function(data) {
                            requestDone(false, data, callback);
                        },
                        error: function() {
                            requestDone(true, null, callback);
                        },
                        previousRequest: _deleteEntriesRequest
                    });
                };

                function requestDone(hasError, data, callback) {
                    if (hasError) {
                        $rootScope.$emit('np-connections-error');
                    }

                    if (_.isFunction(callback)) {
                        callback(hasError, data);
                    }
                }

                function resetChecked() {
                    _checked = {};
                }

                function resetEntries() {
                    me.entriesResult = null;
                    me.entriesPage = null;
                    resetChecked();
                }
            };
        }]);
    //
});
