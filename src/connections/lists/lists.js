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
                scope: {},
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
                    // new-list
                    //
                    var newList = {
                        list: {
                            name: null,
                            type: 'COMPANY' // TODO null
                        },
                        isReady: function() {
                            return newList.list.name && newList.list.type;
                        },
                        addListEntriesProxy: {
                            getListType: function() {
                                return newList.list.type;
                            }
                        }
                    };

                    //
                    _.extend(scope, {
                        navigation: navigation,
                        lists: lists,
                        newList: newList
                    }, i18n.translateFuncs);

                    // test
                    showNav('#np-connections-lists-new-list');
                }
            };
        }])
        //
        .directive('npConnectionsListsAddListEntries', ['$log', '$timeout', function($log, $timeout){
            return {
                restrict: 'A',
                scope: {
                    proxy: '=npConnectionsListsAddListEntries'
                },
                template: viewTemplates['add-list-entries-view'].html,
                link: function(scope, element, attrs) {
                    //
                    var formElement = element.find('form'),
                        fileElement = element.find('.add-file input'),
                        textElement = element.find('textarea');

                    //
                    _.extend(scope, {
                        target: null,
                        file: null,
                        doTarget: function(target) {
                            if (target === 'text') {
                                resetFile();
                                
                                $timeout(function(){
                                    textElement.focus();
                                });
                            }
                            scope.target = target;
                        }
                    });

                    //
                    fileElement.change(function(e){
                        $timeout(function(){
                            doFile();
                        });
                    });

                    function doFile() {
                        scope.file = _.get(fileElement.get(0), 'files[0]');

                        $log.info('* file:', scope.file);

                        if (scope.file) {
                            // fileReader.readAsDataURL(file);

                            scope.doTarget('file');
                        }
                    }

                    function resetFile() {
                        scope.file = null;
                        formElement.get(0).reset();
                    }
                }
            };
        }]);
    //
});
