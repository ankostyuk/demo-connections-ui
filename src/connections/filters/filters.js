/**
 * @module np.connections.filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.filters', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsFilters', ['$log', function($log){
            // order filters
            var orderFilters = {
                'AFFILIATIONS': {
                    maxDepth: 5,
                    useHistory: true,
                    relationTypes: [
                        'FOUNDER_COMPANY',
                        'FOUNDER_INDIVIDUAL',
                        'HEAD_COMPANY',
                        'EXECUTIVE_COMPANY',
                        'EXECUTIVE_INDIVIDUAL',
                        'AFFILIATED_COMPANY',
                        'AFFILIATED_INDIVIDUAL',
                        'PREDECESSOR_COMPANY',
                        'REGISTER_HOLDER',
                        'ADDRESS',
                        'PHONE',
                        'EMPLOYEE'
                    ]
                },
                'PURCHASES': {
                    maxDepth: 3,
                    useHistory: false,
                    relationTypes: [
                        'CUSTOMER_COMPANY',
                        'COMMISSION_MEMBER',
                        'PARTICIPANT_COMPANY',
                        'PARTICIPANT_INDIVIDUAL'
                    ]
                }
            };

            _.each(orderFilters, function(orderFilter, name){
                orderFilter._name = name;
            });

            //
            return {
                orderFilters: {
                    getFilterByName: function(filterName) {
                        return orderFilters[filterName];
                    },

                    getFilterByRelationTypes: function(relationTypes) {
                        var filter;

                        _.each(orderFilters, function(orderFilter){
                            if (_.isEmpty(_.xor(orderFilter.relationTypes, relationTypes))) {
                                filter = orderFilter;
                                return false;
                            }
                        });

                        return filter;
                    }
                }
            };
        }]);
    //
});
