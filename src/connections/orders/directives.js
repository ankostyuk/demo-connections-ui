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
        .directive('npConnectionsOrders', ['$log', '$timeout', '$rootScope', 'npConnectionsOrdersSet', 'npConnectionsCurrentOrder', 'npConnectionsNavigation', function($log, $timeout, $rootScope, npConnectionsOrdersSet, npConnectionsCurrentOrder, npConnectionsNavigation){
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
                    $rootScope.$on('np-connections-show-orders', function(e, callback){
                        $rootScope.$emit('np-connections-loading', function(done){
                            // scope.ordersSet.fetch(function(){
                                scope.navigation.showNav('#np-connections-orders-orders-set');

                                if (_.isFunction(callback)) {
                                    callback();
                                }

                                done();
                            // });
                        });
                    });
                }
            };
        }]);
    //
});
