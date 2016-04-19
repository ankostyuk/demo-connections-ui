/**
 * @module data-mocks
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var angular         = require('angular');
                          require('angular-mocks');

    var purl            = require('purl'),
        locationSearch  = purl().param(),
        emptyLists      = locationSearch['empty-lists'] === 'true';

    var testData = {
        'lists':    angular.fromJson(emptyLists ? require('text!./data/empty-lists.json') : require('text!./data/lists.json')),
        'orders':   angular.fromJson(require('text!./data/orders.json'))
    };

    //
    return angular.module('data-mocks', ['ngMockE2E'])
        //
        .run(['$log', '$httpBackend', function($log, $httpBackend){
            $log.info('testData:', testData);

            // ignore
            $httpBackend.whenGET(/^\/siteapp\//).passThrough();
            $httpBackend.whenPOST(/^\/siteapp\//).passThrough();

            // lists
            $httpBackend.whenGET('/connections/api/lists').respond(testData['lists']);
        }]);
    //
});
