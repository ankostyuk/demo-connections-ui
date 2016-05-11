/**
 * @module data-mocks
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');
                          require('angular-mocks');

    var purl                = require('purl'),
        locationSearch      = purl().param(),
        emptyLists          = _.toBoolean(locationSearch['test-empty-lists']),
        auth                = locationSearch['test-auth'] && _.toBoolean(locationSearch['test-auth']),
        siteappDelay        = parseInt(locationSearch['test-siteapp-delay']) || 0,
        connectionsDelay    = parseInt(locationSearch['test-connections-delay']) || 0;

    var testData = {
        'connections': {
            'lists':            angular.fromJson(emptyLists ? require('text!./data/connections/empty-lists.json') : require('text!./data/connections/lists.json')),
            'list-x-entries':   angular.fromJson(require('text!./data/connections/list-x-entries.json')),
            'orders':           angular.fromJson(require('text!./data/connections/orders.json'))
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
    function getRequestDelay(url) {
        var delay = /^\/siteapp\//.test(url) ? siteappDelay : connectionsDelay;
        return delay;
    }

    //
    return angular.module('data-mocks', ['ngMockE2E'])
        //
        .config(function($provide) {
            // delay mock backend responses
            // https://github.com/bahmutov/infinite-fake-data#slowing-down-mock-respones
            $provide.decorator('$httpBackend', function($delegate) {
                var proxy = function(method, url, data, callback, headers) {
                    var interceptor = function() {
                        var _this       = this,
                            _arguments  = arguments;

                        setTimeout(function() {
                            // return result to the client AFTER delay
                            callback.apply(_this, _arguments);
                        }, getRequestDelay(url));
                    };

                    return $delegate.call(this, method, url, data, interceptor, headers);
                };

                for (var key in $delegate) {
                    proxy[key] = $delegate[key];
                }

                return proxy;
            });
        })
        //
        .run(['$log', '$httpBackend', '$timeout', function($log, $httpBackend, $timeout){
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
            $httpBackend.whenGET('/connections/api/list/list-x/entries').respond(testData['connections']['list-x-entries']);
        }]);
    //
});
