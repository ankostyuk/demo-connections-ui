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
        .factory('npConnectionsCurrentList', ['$log', '$rootScope', 'npConnectionsListsResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsListsResource, npConnectionsUtils){
            return function() {
                var me                      = this,
                    _updateRequest          = null,
                    _deleteRequest          = null,
                    _entriesRequest         = null,
                    _deleteEntriesRequest   = null;

                me.info = null;
                me.entriesResult = new npConnectionsUtils.PaginationResult();

                me.checked = new npConnectionsUtils.Checked({
                    checkedProperty: '__checked',
                    idProperty: 'id'
                });

                me.addListEntriesProxy = {
                    addActionEnabled: true,
                    getListId: function() {
                        return me.info.id;
                    },
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

                        var entryIds = all ? null : _.pluck(me.checked.getChecked(), 'id');

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
                    reset();
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
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _updateRequest
                    });
                };

                me.delete = function(callback) {
                    _deleteRequest = npConnectionsListsResource.deleteList({
                        id: me.info.id,
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _deleteRequest
                    });
                };

                me.fetchEntries = function(callback) {
                    resetChecked();

                    _entriesRequest = npConnectionsListsResource.listEntries({
                        id: me.info.id,
                        success: function(data) {
                            me.entriesResult.setResult(data);

                            _.each(me.entriesResult.getList(), function(entry){
                                entry.__inlineEditProxy = {
                                    onEdit: function(newText, oldText, data) {
                                        $log.info('* list entry onEdit...', newText, oldText, entry);
                                        entry.userData = newText;
                                        // TODO
                                    }
                                };
                            });

                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            resetEntries();
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _entriesRequest
                    });
                };

                me.deleteEntries = function(entryIds, callback) {
                    _deleteEntriesRequest = npConnectionsListsResource.deleteListEntries({
                        id: me.info.id,
                        data: entryIds || undefined,
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _deleteEntriesRequest
                    });
                };

                function resetChecked() {
                    me.checked.resetChecked();
                }

                function resetEntries() {
                    me.entriesResult.reset();
                    resetChecked();
                }

                function reset() {
                    if (_.isFunction(me.inlineEditProxy.off)) {
                        me.inlineEditProxy.off();
                    }
                    if (_.isFunction(me.addListEntriesProxy.reset)) {
                        me.addListEntriesProxy.reset();
                    }

                    resetEntries();
                }
            };
        }]);
    //
});
