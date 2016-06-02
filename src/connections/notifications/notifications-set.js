/**
 * @module np.connections.notifications-set
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.notifications-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNotificationsSet', ['$log', '$rootScope', '$interval', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, $interval, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me                  = this,
                    _lookatOrders       = {},
                    _pollingInterval    = 5000, // !!!
                    _notifiedOrderStatuses      = ['READY', 'FAILED'],
                    _fetchOrdersStateRequest    = null;

                me.list = [];

                me.isEmpty = function() {
                    return _.isEmpty(me.list);
                };

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

                        if (order.status !== lookatOrder.status) {
                            lookatOrder.status = order.status;

                            delete _lookatOrders[orderId];

                            if (_.includes(_notifiedOrderStatuses, order.status)) {
                                newOrderStateNotify(lookatOrder);
                            }
                        }
                    });
                }

                function newOrderStateNotify(order) {
                    me.list.push({
                        order: order
                    });
                    $rootScope.$emit('np-connections-new-notification');
                }

                me.showOrder = function(order) {
                    $rootScope.$emit('np-connections-show-desktop-nav', '#np-connections-orders');
                    $rootScope.$emit('np-connections-show-order', order);
                };

                $rootScope.$on('np-connections-new-order', function(e, order){
                    _lookatOrders[order.id] = order;
                });

                polling();
            };
        }]);
    //
});
