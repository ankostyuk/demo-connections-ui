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
    var i18n            = require('i18n'),
        angular         = require('angular'),
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
                            e.preventDefault();
                            showNav($(e.currentTarget).attr('data-target'));
                        }
                    };

                    function showNav(target) {
                        element.find('[data-target="' + target + '"]').eq(0)
                            .tab('show').parent('li').removeClass('active');

                        scope.navigation.prevTarget = scope.navigation.currentTarget;
                        scope.navigation.currentTarget = target;
                    }

                    //
                    // lists
                    //
                    var lists = {
                        request: null,
                        list: [],
                        checked: {},
                        isEmpty: function() {
                            return _.isEmpty(lists.list);
                        },
                        check: function(list) {
                            list.__checked = !list.__checked;

                            if (list.__checked) {
                                lists.checked[list.id] = list;
                            } else {
                                delete lists.checked[list.id];
                            }
                        },
                        isChecked: function() {
                            return !_.isEmpty(lists.checked);
                        }
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

                    showLists();

                    //
                    _.extend(scope, {
                        navigation: navigation,
                        lists: lists
                    }, i18n.translateFuncs);

                    // test
                    showNav('#np-connections-lists-new-list');
                }
            };
        }]);
    //
});
