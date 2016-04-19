/**
 * @module lists
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var template        = require('text!./views/lists.html'),
        templateData, viewTemplates;

                          require('jquery');
                          require('lodash');
    var angular         = require('angular'),
        templateUtils   = require('template-utils');

                          require('np.resource');

    //
    return angular.module('np.connections.lists', ['np.resource'])
        //
        .run([function(){
            templateData    = templateUtils.processTemplate(template);
            viewTemplates   = templateData.templates;
        }])
        //
        .factory('npConnectionsListsResource', ['$log', 'appConfig', 'npResource', function($log, appConfig, npResource){

            var config = appConfig.resource || {};

            // API
            return {

                lists: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: config['lists.url']
                    }, null, options);
                }
            };
        }])
        //
        .directive('npConnectionsLists', ['$log', 'npConnectionsListsResource', function($log, npConnectionsListsResource){
            return {
                restrict: 'A',
                scope: true,
                template: viewTemplates['lists-view'].html,
                link: function(scope, element, attrs) {
                    //
                    // navigation
                    //
                    var navigation = {
                        currentTarget: null,
                        prevTarget: null,
                        doNav: function(e) {
                            var el = $(e.currentTarget);

                            el.tab('show').parent('li').removeClass('active');

                            scope.navigation.prevTarget = scope.navigation.currentTarget;
                            scope.navigation.currentTarget = el.attr('data-target');

                            e.preventDefault();
                        }
                    };

                    scope.navigation = navigation;

                    //
                    // lists
                    //
                    var lists = {
                        request: null,
                        list: []
                    };

                    function showLists() {
                        lists.request = npConnectionsListsResource.lists({
                            success: function(data){
                                lists.list = data;
                            },
                            error: function(){
                                $log.warn('getting lists... error');
                            },
                            previousRequest: lists.request
                        });
                    }

                    scope.lists = lists;

                    showLists();
                }
            };
        }]);
    //
});
