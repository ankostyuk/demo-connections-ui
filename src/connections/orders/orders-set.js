/**
 * @module np.connections.orders-set
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
    return angular.module('np.connections.orders-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsOrdersSet', ['$log', '$rootScope', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me                      = this,
                    _request                = null,
                    _deleteOrdersRequest    = null;

                me.result = new npConnectionsUtils.PaginationResult();

                me.checked = new npConnectionsUtils.Checked({
                    checkedProperty: '__checked',
                    idProperty: 'id'
                });

                me.fetch = function(callback) {
                    resetChecked();

                    _request = npConnectionsOrdersResource.orders({
                        success: function(data) {
                            me.result.setResult(data);
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            resetResult();
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });
                };

                me.doDeleteOrders = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        var orderIds = _.pluck(me.checked.getChecked(), 'id');

                        me.deleteOrders(orderIds, function(hasError){
                            if (hasError) {
                                done();
                            } else {
                                me.fetch(done);
                                $rootScope.$emit('np-connections-delete-orders', orderIds);
                            }
                        });
                    });
                };

                me.deleteOrders = function(orderIds, callback) {
                    _deleteOrdersRequest = npConnectionsOrdersResource.deleteOrders({
                        data: orderIds,
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _deleteOrdersRequest
                    });
                };

                me.showOrder = function(order) {
                    $rootScope.$emit('np-connections-show-order', order);
                };

                function resetChecked() {
                    me.checked.resetChecked();
                }

                function resetResult() {
                    me.result.reset();
                    resetChecked();
                }
            };
        }]);
    //
});
