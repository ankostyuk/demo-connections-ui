/**
 * @module data-mocks
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');
                          require('angular-mocks');

    var purl            = require('purl'),
        locationSearch  = purl().param(),
        emptyLists      = _.toBoolean(locationSearch['test-empty-lists']),
        auth            = locationSearch['test-auth'] && _.toBoolean(locationSearch['test-auth']);

    var testData = {
        'connections': {
            'lists':    angular.fromJson(emptyLists ? require('text!./data/connections/empty-lists.json') : require('text!./data/connections/lists.json')),
            'orders':   angular.fromJson(require('text!./data/connections/orders.json'))
        },
        'siteapp': {
            'login':            angular.fromJson(require('text!./data/siteapp/login.json')),
            'login-error':      angular.fromJson(require('text!./data/siteapp/login-error.json')),
            'logout':           204,
            'limits':           angular.fromJson(require('text!./data/siteapp/limits.json')),
            'limits-forbidden': 403
        }
    };

    //
    return angular.module('data-mocks', ['ngMockE2E'])
        //
        .run(['$log', '$httpBackend', function($log, $httpBackend){
            $log.info('testData:', testData);

            // user
            if (_.isUndefined(auth)) {
                $httpBackend.whenGET(/^\/siteapp\//).passThrough();
                $httpBackend.whenPOST(/^\/siteapp\//).passThrough();
            } else {
                $httpBackend.whenPOST('/siteapp/login').respond(auth ? testData['siteapp']['login'] : testData['siteapp']['login-error']);
                $httpBackend.whenGET('/siteapp/logout').respond(testData['siteapp']['logout']);
                $httpBackend.whenGET('/siteapp/api/users/me/limits').respond(auth ? testData['siteapp']['limits'] : testData['siteapp']['limits-forbidden']);
            }

            // lists
            $httpBackend.whenGET('/connections/api/lists').respond(testData['connections']['lists']);
        }]);
    //
});
