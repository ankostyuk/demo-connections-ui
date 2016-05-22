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
        .directive('npConnectionsOrders', ['$log', '$timeout', '$rootScope', 'npConnectionsOrdersSet', 'npConnectionsCurrentOrder', function($log, $timeout, $rootScope, npConnectionsOrdersSet, npConnectionsCurrentOrder){
            return {
                restrict: 'A',
                scope: {},
                template: templates['orders-view'].html,
                link: function(scope, element, attrs) {
                    // Navigation
                    // TODO обобщить с src/connections/lists/directives.js Navigation
                    function Navigation() {
                        var me = this;

                        me.currentTarget = null;
                        me.prevTarget = null;

                        me.showNav = function(target, noStore) {
                            element
                                .find('[data-target="' + target + '"]')
                                .eq(0).tab('show')
                                .parent('li').removeClass('active');

                            me.prevTarget = noStore ? null : me.currentTarget;
                            me.currentTarget = target;
                        };

                        me.doNav = function(e) {
                            e.preventDefault();
                            me.showNav($(e.currentTarget).attr('data-target'));
                        };

                        me.showDesktopTab = function(target) {
                            $rootScope.$emit('np-connections-show-desktop-tab', target);
                        };
                    }

                    //
                    _.extend(scope, {
                        navigation:     new Navigation(),
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
