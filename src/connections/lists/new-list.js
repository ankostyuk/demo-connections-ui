/**
 * @module np.connections.new-list
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
    return angular.module('np.connections.new-list', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNewList', ['$log', 'npConnectionsListsResource', function($log, npConnectionsListsResource){
            return function() {
                var me = this;

                me.info = {
                    name: null,
                    type: null
                };

                me.isReady = function() {
                    return me.info.name && me.info.type;
                };

                me.addListEntriesProxy = {
                    addActionEnabled: false,
                    getListType: function() {
                        return me.info.type;
                    }
                };
            };
        }]);
    //
});
