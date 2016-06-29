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
        .factory('npConnectionsListsSet', ['$log', '$rootScope', '$timeout', 'npConnectionsListsResource', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, $timeout, npConnectionsListsResource, npConnectionsOrdersResource, npConnectionsUtils){
            return function(options) {
                var me                  = this,
                    _request            = null,
                    _createOrderRequest = null;

                me.successfulOrder = null;

                me.result = new npConnectionsUtils.PaginationResult({
                    element: options.paginationResultElement,
                    showingItemNumbers: true,
                    doNextPage: function(isFirstPage, pageConfig, callback) {
                        if (isFirstPage) {
                            return fetchRequest(pageConfig, callback).completePromise;
                        }

                        return $rootScope.$emit('np-connections-loading', function(done){
                            fetchRequest(pageConfig, done);
                        }).targetScope.loader.completePromise;
                    }
                });

                me.checked = new npConnectionsUtils.Checked({
                    checkedProperty: '__checked',
                    idProperty: 'id'
                });

                me.checkOptions = {
                    insideList: false
                };

                me.check = function(list) {
                    me.checked.check(list);
                    resetOrder();
                };

                me.fetch = function(callback) {
                    resetChecked();
                    me.result.firstPage(callback);
                };

                function fetchRequest(pageConfig, callback) {
                    _request = npConnectionsListsResource.lists({
                        params: pageConfig,
                        success: function(data) {
                            me.result.setResult(data);
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            // resetResult();
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });

                    return _request;
                }

                me.doOrder = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        me.createOrder(function(hasError, response){
                            var order = response.data;

                            if (hasError) {
                                me.successfulOrder = false;
                                done();
                            } else {
                                $rootScope.$emit('np-connections-new-order', order, function(){
                                    me.successfulOrder = true;
                                    done();
                                });
                            }
                        });
                    });
                };

                me.createOrder = function(callback) {
                    _createOrderRequest = npConnectionsOrdersResource.createOrder({
                        data: {
                            userListIds: _.pluck(me.checked.getChecked(), 'id'),
                            checkOptions: {
                                insideList: me.checked.getCheckedCount() > 1 ? me.checkOptions.insideList : true
                            }
                        },
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _createOrderRequest
                    });

                    function done(hasError, data) {
                        if (_.isFunction(callback)) {
                            callback(hasError, data);
                        }
                    }
                };

                me.showList = function(list) {
                    $rootScope.$emit('np-connections-show-list', list);
                };

                function resetChecked() {
                    me.checked.resetChecked();
                    resetOrder();
                }

                function resetResult() {
                    me.result.reset();
                    resetChecked();
                }

                function resetOrder() {
                    me.successfulOrder = null;
                }
            };
        }]);
    //
});
