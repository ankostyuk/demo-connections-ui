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

    var angularModules = [
    ];

    //
    return angular.module('np.connections.orders.directives', _.pluck(angularModules, 'name'))
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
                    var navOptions = {
                        element: element,
                        markActive: false
                    };

                    _.extend(scope, {
                        navigation:     new npConnectionsNavigation(navOptions),
                        ordersSet:      new npConnectionsOrdersSet(),
                        currentOrder:   new npConnectionsCurrentOrder()
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
