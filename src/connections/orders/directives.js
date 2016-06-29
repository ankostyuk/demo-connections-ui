/**
 * @module np.connections.orders.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var templates       = require('text!./views/orders.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

                          require('ng-infinite-scroll');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.orders.directives', _.pluck(angularModules, 'name').concat(['infinite-scroll']))
        //
        .run([function(){
            templates = templateUtils.processTemplate(templates).templates;
        }])
        //
        .directive('npConnectionsOrders', ['$log', '$timeout', '$rootScope', 'npConnectionsOrdersSet', 'npConnectionsCurrentOrder', 'npConnectionsNavigation', 'npRsearchViews', 'npRsearchNavigationHelper', function($log, $timeout, $rootScope, npConnectionsOrdersSet, npConnectionsCurrentOrder, npConnectionsNavigation, npRsearchViews, npRsearchNavigationHelper){
            return {
                restrict: 'A',
                scope: {},
                template: templates['orders-view'].html,
                link: function(scope, element, attrs) {
                    //
                    var viewedOrderId;

                    //
                    _.extend(scope, {
                        navigation: new npConnectionsNavigation({
                            element: element,
                            markActive: false,
                            targets: {
                                '#np-connections-orders-orders-set': {
                                    after: function(targetProxy) {
                                        $rootScope.$emit('np-connections-scroll-to-item-or-top', scope.buildOrderItemDomId(viewedOrderId));
                                    }
                                },
                                '#np-connections-orders-current-order': {
                                    after: function(targetProxy) {
                                        $rootScope.$emit('np-connections-scroll-top');
                                    }
                                }
                            }
                        }),

                        ordersSet: new npConnectionsOrdersSet({
                            paginationResultElement: element.find('.orders-set .orders')
                        }),

                        currentOrder: new npConnectionsCurrentOrder(),

                        buildOrderItemDomId: function(orderId) {
                            return orderId ? ('order-' + orderId) : null;
                        }
                    }, i18n.translateFuncs);

                    //
                    var nodeTracesElement   = element.find('.current-order .node-traces-view'),
                        nodeTracesView      = npRsearchViews.createNodeTracesView(nodeTracesElement, scope, npRsearchNavigationHelper.getNavigationProxy());

                    scope.currentOrder.setNodeTracesView(nodeTracesView);

                    //
                    $rootScope.$on('np-connections-show-orders', function(e, callback){
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.ordersSet.fetch(function(){
                                scope.navigation.showNav('#np-connections-orders-orders-set');

                                if (_.isFunction(callback)) {
                                    callback();
                                }

                                done();

                                // test
                                // $rootScope.$emit('np-connections-show-order', scope.ordersSet.result.getList()[0]);
                            });
                        });
                    });

                    $rootScope.$on('np-connections-show-order', function(e, order, callback){
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.currentOrder.fetch(order, function(hasError){
                                if (hasError) {
                                    complete();
                                    return;
                                }

                                viewedOrderId = order.id;

                                scope.currentOrder.sendOrderView(function(){
                                    complete();
                                });
                            });

                            function complete() {
                                scope.navigation.showNav('#np-connections-orders-current-order');

                                if (_.isFunction(callback)) {
                                    callback();
                                }

                                done();
                            }
                        });
                    });

                    $rootScope.$on('np-connections-new-order', function(e, order, callback){
                        scope.ordersSet.fetch(function(){
                            if (_.isFunction(callback)) {
                                callback();
                            }
                        });
                    });

                    $rootScope.$on('np-connections-delete-orders', function(e, orderIds){
                        viewedOrderId = null;
                        scope.navigation.showNav('#np-connections-orders-orders-set', true);
                    });
                }
            };
        }])
        //
        .directive('npConnectionsOrdersViewedInfo', ['$log', '$timeout', '$rootScope', 'npConnectionsOrdersSet', 'npConnectionsCurrentOrder', 'npConnectionsNavigation', 'npRsearchViews', 'npRsearchNavigationHelper', function($log, $timeout, $rootScope, npConnectionsOrdersSet, npConnectionsCurrentOrder, npConnectionsNavigation, npRsearchViews, npRsearchNavigationHelper){
            return {
                restrict: 'A',
                scope: {},
                template: templates['orders-viewed-info-view'].html,
                link: function(scope, element, attrs) {
                    $rootScope.$on('np-connections-orders-viewed-change', function(e, notViewedOrderCount){
                        scope.notViewedOrderCount = notViewedOrderCount;
                    });
                }
            };
        }]);
    //
});
