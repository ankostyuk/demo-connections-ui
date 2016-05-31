/**
 * @module np.connections.current-order
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
    return angular.module('np.connections.current-order', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsCurrentOrder', ['$log', '$rootScope', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me          = this,
                    _request    = null;

                me.order = null;

                me.getListCount = function() {
                    return _.size(_.get(me.order, 'userLists'));
                };

                me.getResultPairs = function() {
                    return _.get(me.order, 'result.pairs');
                };

                me.isEmptyResult = function() {
                    return _.get(me.order, 'status') === 'READY' && _.isEmpty(me.getResultPairs());
                };

                me.isResult = function() {
                    return _.get(me.order, 'status') === 'READY' && !_.isEmpty(me.getResultPairs());
                };

                me.getResultEntries = function() {
                    return _.get(me.order, 'result.entries');
                };

                me.getResultEntry = function(index) {
                    return _.get(me.getResultEntries(), index);
                };

                me.fetch = function(order, callback) {
                    me.order = order;
                    reset();
                    me.fetchOrder(callback);
                };

                me.fetchOrder = function(callback) {
                    _request = npConnectionsOrdersResource.order({
                        id: me.order.id,
                        success: function(data) {
                            _.extend(me.order, data);
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });
                };

                me.setNodeTracesView = function(nodeTracesView) {
                };

                function reset() {
                }
            };
        }]);
    //
});
