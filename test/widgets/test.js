/**
 * @module test
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('connections/widgets/widgets'),
        require('../test/test')
    ];

    //
    return angular.module('widgets.test', _.pluck(angularModules, 'name'))
        //
        .run(['$log', function($log){
        }])
        //
        .factory('widgetsTestHelper', ['$log', '$rootScope', '$http', function($log, $rootScope, $http){

            // API
            return {
                initTestData: function() {
                    var testData = $rootScope.testData = {
                        'nodes': {
                            'search-result': null
                        }
                    };

                    $http({
                        method: 'GET',
                        url: '/nkbrelation/api/nodes/COMPANY?q=НАЦИОНАЛЬНОЕ КРЕДИТНОЕ БЮРО'
                    }).success(function(data){
                        testData['nodes']['search-result'] = data;
                    });
                }
            };
        }]);
    //
});
