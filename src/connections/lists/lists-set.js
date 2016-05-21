/**
 * @module np.connections.lists-set
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
    return angular.module('np.connections.lists-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsListsSet', ['$log', '$rootScope', 'npConnectionsListsResource', function($log, $rootScope, npConnectionsListsResource){
            return function() {
                var me          = this,
                    _request    = null,
                    _checked    = {};

                me.result = null;
                me.page = null;
                me.isRequestDone = false;
                me.successfulOrder = null;

                me.checkOptions = {
                    insideList: false
                };

                me.isEmpty = function() {
                    return !_.get(me.page, 'totalElements');
                };

                me.check = function(list) {
                    list.__checked = !list.__checked;

                    if (list.__checked) {
                        _checked[list.id] = list;
                    } else {
                        delete _checked[list.id];
                    }

                    resetOrder();
                };

                me.isChecked = function() {
                    return !_.isEmpty(_checked);
                };

                me.getCheckedCount = function() {
                    return _.size(_checked);
                };

                me.fetch = function(callback) {
                    me.isRequestDone = false;

                    resetChecked();

                    _request = npConnectionsListsResource.lists({
                        success: function(data) {
                            me.result = _.get(data, '_embedded');
                            me.page = _.get(data, 'page');
                            requestDone(false, data, callback);
                        },
                        error: function() {
                            resetResult();
                            requestDone(true, null, callback);
                        },
                        previousRequest: _request
                    });
                };

                me.doOrder = function() {
                    // TODO
                    me.successfulOrder = true;
                };

                me.showList = function(list) {
                    $rootScope.$emit('np-connections-do-show-list', list);
                };

                function requestDone(hasError, data, callback) {
                    me.isRequestDone = true;

                    if (hasError) {
                        $rootScope.$emit('np-connections-error');
                    }

                    if (_.isFunction(callback)) {
                        callback(hasError, data);
                    }
                }

                function resetChecked() {
                    _checked = {};
                    resetOrder();
                }

                function resetResult() {
                    me.result = null;
                    me.page = null;
                }

                function resetOrder() {
                    me.successfulOrder = null;
                }
            };
        }]);
    //
});
