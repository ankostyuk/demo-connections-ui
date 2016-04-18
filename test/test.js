//
define(function(require, exports, module) {'use strict';
    var angular         = require('angular');
                          require('angular-mocks');

    var purl            = require('purl'),
        locationSearch  = purl().param(),
        testEnabled     = locationSearch['test'] === 'true';

    if (!testEnabled) {
        return angular.module('test', []);
    }

    var testData = {
        'lists':    angular.fromJson(require('text!./data/lists.json')),
        'orders':   angular.fromJson(require('text!./data/orders.json'))
    };

    //
    return angular.module('test', ['ngMockE2E'])
        //
        .run(['$httpBackend', function($httpBackend){
            console.info('test enabled');
            console.info('testData:', testData);

            // ignore
            $httpBackend.whenGET(/^\/siteapp\//).passThrough();

            // lists
            $httpBackend.whenGET('/connections/api/lists').respond(testData['lists']);
        }]);
    //
});
