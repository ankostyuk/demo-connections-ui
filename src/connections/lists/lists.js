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
                },

                listEntries: function(options) {
                    return npResource.request({
                        method: 'GET',
                        url: '/connections/api/list/list-x/entries' // TODO config['list-entries.url'] + listId
                    }, null, options);
                }
            };
        }])
        //
        .factory('npConnectionsListsFactory', ['$log', 'npConnectionsListsResource', function($log, npConnectionsListsResource){
            // Classes
            return {
                // Lists Set
                ListsSet: function() {
                    var me          = this,
                        _request    = null,
                        _checked    = {};

                    me.result = [];
                    me.isRequestDone = false;

                    me.isEmpty = function() {
                        return _.isEmpty(me.result);
                    };

                    me.check = function(list) {
                        list.__checked = !list.__checked;

                        if (list.__checked) {
                            _checked[list.id] = list;
                        } else {
                            delete _checked[list.id];
                        }
                    };

                    me.isChecked = function() {
                        return !_.isEmpty(_checked);
                    };

                    me.fetch = function(callback) {
                        me.isRequestDone = false;

                        _request = npConnectionsListsResource.lists({
                            success: function(data){
                                me.result = _.get(data, '_embedded.list');
                                // TODO paging: page data
                                done();
                            },
                            error: function(){
                                $log.warn('getting lists... error');
                                done();
                            },
                            previousRequest: _request
                        });

                        function done() {
                            me.isRequestDone = true;
                            callback && callback();
                        }
                    };
                },

                // New List
                NewList: function() {
                    var me = this;

                    me.info = {
                        name: null,
                        type: null
                    };

                    me.isReady = function() {
                        return me.info.name && me.info.type;
                    };

                    me.addListEntriesProxy = {
                        addActionEnabled: false,
                        getListType: function() {
                            return me.info.type;
                        }
                    };
                },

                // Current List
                CurrentList: function() {
                    var me          = this,
                        _request    = null,
                        _checked    = {};

                    // TODO
                    me.info = {
                        name: 'Компании-участники тендера на поставку оборудования для цеха №1',
                        type: 'COMPANY'
                    };

                    // TODO
                    me.result = null;

                    me.getEntriesCount = function() {
                        return _.get(me.result, 'total');
                    };

                    me.isEmpty = function() {
                        return !me.getEntriesCount();
                    };

                    me.remove = function() {
                        $log.warn('* remove list');
                    };

                    me.clean = function() {
                        $log.warn('* clean list');
                    };

                    me.removeCheckedEntries = function() {
                        $log.warn('* removeCheckedEntries...', _checked);
                    };

                    me.check = function(entry) {
                        entry.__checked = !entry.__checked;

                        if (entry.__checked) {
                            _checked[entry.id] = entry;
                        } else {
                            delete _checked[entry.id];
                        }
                    };

                    me.isChecked = function() {
                        return !_.isEmpty(_checked);
                    };

                    me.addListEntriesProxy = {
                        addActionEnabled: true,
                        getListType: function() {
                            return me.info.type;
                        }
                    };

                    me.inlineEditProxy = {
                        onEdit: function(newText, oldText, data) {
                            me.info.name = newText;
                        }
                    };

                    me.fetch = function() {
                        _request = npConnectionsListsResource.listEntries({
                            success: function(data){
                                _.each(data.list, function(entry){
                                    entry.__inlineEditProxy = {
                                        onEdit: function(newText, oldText, data) {
                                            $log.info('* list entry onEdit...', newText, oldText, entry);
                                            entry.userData = newText;
                                            // TODO
                                        }
                                    };

                                });

                                me.result = data;

                                $log.info('getting list entries...', me.result);
                            },
                            error: function(){
                                $log.warn('getting list entries... error');
                            },
                            previousRequest: _request
                        });
                    };
                }
            };
        }])
        //
        .directive('npConnectionsLists', ['$log', '$timeout', '$rootScope', 'npConnectionsListsFactory', function($log, $timeout, $rootScope, npConnectionsListsFactory){
            return {
                restrict: 'A',
                scope: {},
                template: viewTemplates['lists-view'].html,
                link: function(scope, element, attrs) {
                    // Navigation
                    function Navigation() {
                        var me = this;

                        me.currentTarget = null;
                        me.prevTarget = null;

                        me.showNav = function(target) {
                            element
                                .find('[data-target="' + target + '"]')
                                .eq(0).tab('show')
                                .parent('li').removeClass('active');

                            me.prevTarget = me.currentTarget;
                            me.currentTarget = target;
                        };

                        me.doNav = function(e) {
                            e.preventDefault();
                            me.showNav($(e.currentTarget).attr('data-target'));
                        };
                    }

                    //
                    _.extend(scope, {
                        navigation:     new Navigation(),
                        listsSet:       new npConnectionsListsFactory.ListsSet(),
                        newList:        new npConnectionsListsFactory.NewList(),
                        currentList:    new npConnectionsListsFactory.CurrentList()
                    }, i18n.translateFuncs);

                    function showLists() {
                        $rootScope.loading(function(done){
                            scope.navigation.showNav('#np-connections-lists-lists-set');
                            scope.listsSet.fetch(function(){
                                done();
                            });
                        });
                    }

                    $rootScope.$on('np-connections-do-show-lists', function(){
                        showLists();
                    });

                    // test
                    // scope.listsSet.fetch();
                    // scope.currentList.fetch();
                    // scope.navigation.showNav('#np-connections-lists-lists-set');

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
