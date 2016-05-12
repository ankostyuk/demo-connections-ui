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
                    $log.warn('* remove list');
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
                    }
                };

                me.fetch = function(list, callback) {
                    $log.info('CurrentList::fetch...', list);
                    me.info = list;
                    me.fetchEntries(list.id, callback);
                };

                me.fetchEntries = function(listId, callback) {
                    _entriesRequest = npConnectionsListsResource.listEntries({
                        id: listId,
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
