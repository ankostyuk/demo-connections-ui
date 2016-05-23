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
        emptyOrders         = _.toBoolean(locationSearch['test-empty-orders']),
        auth                = locationSearch['test-auth'] && _.toBoolean(locationSearch['test-auth']),
        siteappDelay        = parseInt(locationSearch['test-siteapp-delay']) || 0,
        connectionsDelay    = parseInt(locationSearch['test-connections-delay']) || 0;

    var testData = {
        'connections': {
            'lists':            angular.fromJson(emptyLists ? require('text!./data/connections/empty-lists.json') : require('text!./data/connections/lists.json')),

            'list': {
                'list-1': {
                    'entries':      angular.fromJson(require('text!./data/connections/list/empty-entries.json'))
                },
                'list-2': {
                    'entries':      angular.fromJson(require('text!./data/connections/list/list-2/entries.json'))
                },

                'empty-entries':    angular.fromJson(require('text!./data/connections/list/empty-entries.json'))
            },

            'orders':           angular.fromJson(emptyOrders ? require('text!./data/connections/empty-orders.json') : require('text!./data/connections/orders.json'))
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
    var userId = testData['siteapp']['limits']['userId'];

    function getList(listId) {
        return _.find(testData['connections']['lists']['_embedded']['list'], function(list){
            return list.id === listId;
        });
    }

    //
    function getRequestDelay(url) {
        var delay = /^\/siteapp\//.test(url) ? siteappDelay : connectionsDelay;
        return delay;
    }

    function getUrlParam(url, after) {
        var params  = url.split('/'),
            param   = null;

        _.each(url.split('/'), function(p, i){
            if (p === after) {
                param = params[i + 1];
                return false;
            }
        });

        return param;
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

            // list
            $httpBackend.whenPOST('/connections/api/list').respond(function(method, url, data, headers, params){
                var listData = angular.fromJson(data);

                if (listData.name === 'error') {
                    return [500];
                }

                var list = _.extend(listData, {
                    id: _.uniqueId('list-x-'),
                    userId: userId
                });

                var d = testData['connections']['lists'];

                d._embedded.list.push(list);
                d.page.totalElements++;

                return [200, list];
            });

            // /connections/api/list/<id>
            $httpBackend.whenPUT(/^\/connections\/api\/list\/[^\/]+/).respond(function(method, url, data){
                var listId      = getUrlParam(url, 'list'),
                    listData    = angular.fromJson(data),
                    list        = getList(listId);

                _.extend(list, listData);

                return [200, list];
            });

            // /connections/api/list/<id>
            $httpBackend.whenDELETE(/^\/connections\/api\/list\/[^\/]+$/).respond(function(method, url){
                var listId  = getUrlParam(url, 'list'),
                    d       = testData['connections']['lists'];

                d._embedded.list = _.reject(d._embedded.list, {
                    id: listId
                });

                d.page.totalElements--;

                return [204];
            });

            // lists
            $httpBackend.whenGET('/connections/api/lists').respond(testData['connections']['lists']);

            // /connections/api/list/<id>/entries
            $httpBackend.whenGET(/^\/connections\/api\/list\/[^\/]+\/entries/).respond(function(method, url){
                var listId  = getUrlParam(url, 'list'),
                    l       = testData['connections']['list'][listId],
                    entries = l ? l['entries'] : testData['connections']['list']['empty-entries'];

                return [200, entries];
            });

            // /connections/api/list/<id>/entries
            $httpBackend.whenDELETE(/^\/connections\/api\/list\/[^\/]+\/entries/).respond(function(method, url, data){
                var listId      = getUrlParam(url, 'list'),
                    entries     = testData['connections']['list'][listId]['entries'],
                    entryIds    = angular.fromJson(data);

                if (entryIds) {
                    entries._embedded.list = _.reject(entries._embedded.list, function(entry){
                        return _.includes(entryIds, entry.id);
                    });
                    entries.page.totalElements -= _.size(entryIds);
                } else {
                    delete entries._embedded;
                    entries.page.totalElements = 0;
                }

                return [204];
            });

            // orders
            $httpBackend.whenGET('/connections/api/orders').respond(testData['connections']['orders']);
        }]);
    //
});
