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
        .factory('npConnectionsOrdersSet', ['$log', '$rootScope', '$interval', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, $interval, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me                          = this,
                    _notViewedOrders            = {},
                    _lookatOrders               = {},
                    _pollingInterval            = 5000, // !!!
                    _request                    = null,
                    _deleteOrdersRequest        = null,
                    _fetchOrdersStateRequest    = null;

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
                            removeFromNotViewedOrdersByIds(orderIds);
                            removeFromLookatOrdersByIds(orderIds);
                            onViewedOrdersChange();
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _deleteOrdersRequest
                    });
                };

                me.showOrder = function(order) {
                    removeFromNotViewedOrders(order.id);
                    onViewedOrdersChange();
                    $rootScope.$emit('np-connections-show-order', order);
                };

                me.isOrderNotViewed = function(order) {
                    return _.has(_notViewedOrders, order.id);
                };

                function resetChecked() {
                    me.checked.resetChecked();
                }

                function resetResult() {
                    me.result.reset();
                    resetChecked();
                }

                // order notification
                function polling() {
                    $interval(function(){
                        fetchOrdersState();
                    }, _pollingInterval);
                }

                function fetchOrdersState() {
                    if (_.isEmpty(_lookatOrders)) {
                        return;
                    }

                    _fetchOrdersStateRequest = npConnectionsOrdersResource.ordersState({
                        data: _.keys(_lookatOrders),
                        success: function(data) {
                            diffOrders(data);
                        },
                        error: function(data, status) {
                            $log.warn('ERROR: fetchOrdersState...', status);
                        },
                        previousRequest: _fetchOrdersStateRequest
                    });
                }

                function diffOrders(orders) {
                    _.each(orders, function(order){
                        var orderId     = order.id,
                            lookatOrder = _lookatOrders[order.id];

                        if (lookatOrder && lookatOrder.status !== order.status) {
                            lookatOrder.status = order.status;

                            removeFromLookatOrders(orderId);
                            newOrderStateNotify(lookatOrder);
                        }
                    });
                }

                function removeFromLookatOrders(orderId) {
                    delete _lookatOrders[orderId];
                }

                function removeFromLookatOrdersByIds(orderIds) {
                    _.each(orderIds, function(orderId){
                        removeFromLookatOrders(orderId);
                    });
                }

                function getNotViewedOrderCount() {
                    return _.size(_notViewedOrders);
                }

                function removeFromNotViewedOrders(orderId) {
                    delete _notViewedOrders[orderId];
                }

                function removeFromNotViewedOrdersByIds(orderIds) {
                    _.each(orderIds, function(orderId){
                        removeFromNotViewedOrders(orderId);
                    });
                }

                function onViewedOrdersChange() {
                    $rootScope.$emit('np-connections-orders-viewed-change', getNotViewedOrderCount());
                }

                function newOrderStateNotify(lookatOrder) {
                    _notViewedOrders[lookatOrder.id] = lookatOrder;
                    onViewedOrdersChange();
                }

                $rootScope.$on('np-connections-new-order', function(e, order){
                    _lookatOrders[order.id] = order;
                });

                polling();
            };
        }]);
    //
});
