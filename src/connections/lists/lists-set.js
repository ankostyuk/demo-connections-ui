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
        .factory('npConnectionsListsSet', ['$log', '$rootScope', 'npConnectionsListsResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsListsResource, npConnectionsUtils){
            return function() {
                var me          = this,
                    _request    = null;

                me.result = null;
                me.page = null;
                me.successfulOrder = null;

                me.checked = new npConnectionsUtils.Checked({
                    checkedProperty: '__checked',
                    idProperty: 'id'
                });

                me.checkOptions = {
                    insideList: false
                };

                me.isEmpty = function() {
                    return !_.get(me.page, 'totalElements');
                };

                me.check = function(list) {
                    me.checked.check(list);
                    resetOrder();
                };

                me.fetch = function(callback) {
                    resetChecked();

                    _request = npConnectionsListsResource.lists({
                        success: function(data) {
                            me.result = _.get(data, '_embedded');
                            me.page = _.get(data, 'page');
                            npConnectionsUtils.requestDone(false, data, callback);
                        },
                        error: function() {
                            resetResult();
                            npConnectionsUtils.requestDone(true, null, callback);
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

                function resetChecked() {
                    me.checked.resetChecked();
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
