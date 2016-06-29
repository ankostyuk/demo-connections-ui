/**
 * @module np.connections.orders-set
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    // var SockJS          = require('sockjs'); // sockjs#1.1.0
                          require('sockjs'); // sockjs#0.3.4
                          require('stomp');

    var angularModules = [
        require('./resource')
    ];

    //
    return angular.module('np.connections.orders-set', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsOrdersSet', ['$log', '$rootScope', 'appConfig', 'nkbUser', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, appConfig, nkbUser, npConnectionsOrdersResource, npConnectionsUtils){
            var config = appConfig.resource || {};

            return function(options) {
                var me                          = this,
                    _notViewedOrders            = {},
                    _viewedOrders               = {},
                    _request                    = null,
                    _deleteOrdersRequest        = null,
                    user                        = nkbUser.user();

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

                me.fetch = function(callback) {
                    resetChecked();
                    me.result.firstPage(callback);
                };

                function fetchRequest(pageConfig, callback) {
                    _request = npConnectionsOrdersResource.orders({
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

                //
                // order push-notification
                //
                var sockClient          = null,
                    stompClient         = null,
                    stompSubscription   = null;

                $rootScope.$on('nkb-user-apply', function(e, change){
                    if (!change.login) {
                        return;
                    }

                    stopPush();

                    if (user.isAuthenticated()) {
                        startPush();
                    }
                });

                function startPush() {
                    sockClient = new SockJS(config['push.url']);

                    stompClient = Stomp.over(sockClient);
                    stompClient.debug = false;

                    stompClient.connect({}, function(frame){
                        stompSubscription = stompClient.subscribe(config['push.orders.state.url'], function(data){
                            onPushOrdersState(angular.fromJson(data.body));
                        });
                    });
                }

                function stopPush() {
                    if (sockClient) {
                        sockClient.close();
                        sockClient = null;
                    }

                    if (stompSubscription) {
                        stompSubscription.unsubscribe();
                        stompSubscription = null;
                    }

                    if (stompClient) {
                        stompClient.disconnect();
                        stompClient = null;
                    }
                }

                function onPushOrdersState(orders) {
                    _.each(orders, function(orderInfo){
                        var order = me.result.getItemById(orderInfo.id);

                        if (order) {
                            order.status = orderInfo.status;
                        }

                        addToNotViewedOrders(orderInfo.id, orderInfo);
                    });

                    $rootScope.$apply(onViewedOrdersChange());
                }

                function addToNotViewedOrders(orderId, data) {
                    if (!_viewedOrders[orderId]) {
                        _notViewedOrders[orderId] = data;
                    }
                }

                function removeFromNotViewedOrders(orderId) {
                    delete _notViewedOrders[orderId];
                    _viewedOrders[orderId] = true;
                }

                function removeFromNotViewedOrdersByIds(orderIds) {
                    _.each(orderIds, function(orderId){
                        removeFromNotViewedOrders(orderId);
                    });
                }

                function getNotViewedOrderCount() {
                    return _.size(_notViewedOrders);
                }

                function onViewedOrdersChange() {
                    $rootScope.$emit('np-connections-orders-viewed-change', getNotViewedOrderCount());
                }
            };
        }]);
    //
});
