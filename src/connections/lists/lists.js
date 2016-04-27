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

    var angularModules = [
        require('np.resource')
    ];

    //
    return angular.module('np.connections.lists', _.pluck(angularModules, 'name'))
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
        .directive('npConnectionsLists', ['$log', '$timeout', '$rootScope', 'npConnectionsListsResource', function($log, $timeout, $rootScope, npConnectionsListsResource){
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
                            addActionEnabled: false,
                            getListType: function() {
                                return newList.list.type;
                            }
                        }
                    };

                    //
                    // list
                    //
                    var list = {
                        // TODO
                        list: {
                            name: 'Тендерная комиссия тендера на поставку оборудования',
                            type: 'INDIVIDUAL'
                        },
                        // TODO
                        entries: [],
                        isEmpty: function() {
                            return _.isEmpty(list.entries);
                        },
                        addListEntriesProxy: {
                            addActionEnabled: true,
                            getListType: function() {
                                return list.list.type;
                            }
                        }
                    };

                    //
                    _.extend(scope, {
                        navigation: navigation,
                        lists: lists,
                        newList: newList,
                        list: list
                    }, i18n.translateFuncs);

                    // test
                    showNav('#np-connections-lists-list');

                    // $log.warn('loading...');
                    // $timeout(function(){
                    //     $rootScope.loading(function(done){
                    //         $log.info('operation...');
                    //         $timeout(function(){
                    //             done();
                    //         }, 5000);
                    //     });
                    // }, 1000);
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
                        text: null,
                        file: null,
                        isAddActionReady: function() {
                            return _.get(scope, 'proxy.addActionEnabled') &&
                                ((scope.target === 'text' && scope.text) || scope.target === 'file');
                        },
                        cancel: function() {
                            resetFile();
                            resetTarget();
                        },
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
                        scope.$apply(doFile());
                    });

                    function doFile() {
                        var file = _.get(fileElement.get(0), 'files[0]');

                        $log.info('* file:', file);

                        if (!file) {
                            return;
                        }

                        // fileReader.readAsDataURL(scope.file);

                        scope.file = file;
                        scope.doTarget('file');
                    }

                    function resetFile() {
                        scope.file = null;
                        formElement.get(0).reset();
                    }

                    function resetTarget() {
                        scope.doTarget(null);
                    }
                }
            };
        }]);
    //
});
