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
                var me          = this,
                    _request    = null;

                me.result = new npConnectionsUtils.PaginationResult();

                me.checked = new npConnectionsUtils.Checked({
                    checkedProperty: '__checked',
                    idProperty: 'id'
                });

                me.fetch = function(callback) {
                    resetChecked();

                    _request = npConnectionsOrdersResource.orders({
                        success: function(data) {
                            $log.info('* data', data);
                            me.result.setResult(data);
                            npConnectionsUtils.requestDone(false, data, callback);
                        },
                        error: function() {
                            resetResult();
                            npConnectionsUtils.requestDone(true, null, callback);
                        },
                        previousRequest: _request
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
