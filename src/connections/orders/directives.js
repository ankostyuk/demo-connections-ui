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
        require('./orders-set'),
        require('./current-order'),
        require('./resource')
    ];

    //
    return angular.module('np.connections.orders.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templates = templateUtils.processTemplate(templates).templates;
        }])
        //
        .directive('npConnectionsOrders', ['$log', '$timeout', '$rootScope', 'npConnectionsOrdersSet', 'npConnectionsCurrentOrder', 'npConnectionsNavigation', function($log, $timeout, $rootScope, npConnectionsOrdersSet, npConnectionsCurrentOrder, npConnectionsNavigation){
            return {
                restrict: 'A',
                scope: {},
                template: templates['orders-view'].html,
                link: function(scope, element, attrs) {
                    //
                    _.extend(scope, {
                        navigation:     new npConnectionsNavigation(element),
                        ordersSet:      new npConnectionsOrdersSet(),
                        currentOrder:   new npConnectionsCurrentOrder()
                    }, i18n.translateFuncs);

                    function showOrders() {
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.ordersSet.fetch(function(){
                                scope.navigation.showNav('#np-connections-orders-orders-set');
                                done();

                                // test
                                // showOrder(scope.ordersSet.result[0]);
                            });
                        });
                    }

                    function showOrder(order) {
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.currentOrder.fetch(order, function(){
                                scope.navigation.showNav('#np-connections-orders-current-order');
                                done();
                            });
                        });
                    }

                    // $rootScope.$on('np-connections-delete-order', function(e, order, callback){
                    //     scope.ordersSet.fetch(function(){
                    //         scope.navigation.showNav('#np-connections-orders-orders-set', true);
                    //
                    //         if (_.isFunction(callback)) {
                    //             callback();
                    //         }
                    //     });
                    // });
                    //
                    // $rootScope.$on('np-connections-do-show-orders', function(){
                    //     showOrders();
                    // });
                    //
                    // $rootScope.$on('np-connections-do-show-order', function(e, order){
                    //     showOrder(order);
                    // });


                    // test
                    scope.navigation.showNav('#np-connections-orders-orders-set');
                    // me.navigation.showDesktopTab('#np-connections-orders');
                }
            };
        }]);
    //
});
