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
                me.isRequestDone = false;

                me.checkOptions = {
                    insideList: false
                };

                me.isEmpty = function() {
                    return _.isEmpty(me.result);
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

                    _request = npConnectionsListsResource.lists({
                        success: function(data) {
                            me.result = _.get(data, '_embedded.list');
                            // TODO paging: page data
                            done();
                        },
                        error: function() {
                            resetResult();
                            done();
                        },
                        previousRequest: _request
                    });

                    function done() {
                        me.isRequestDone = true;
                        if (_.isFunction(callback)) {
                            callback();
                        }
                    }
                };

                me.doOrder = function() {
                    // TODO
                    me.successfulOrder = true;
                };

                me.showList = function(list) {
                    $rootScope.$emit('np-connections-do-show-list', list);
                };

                function resetResult() {
                    me.result = null;
                }

                function resetOrder() {
                    me.successfulOrder = null;
                }
            };
        }]);
    //
});
