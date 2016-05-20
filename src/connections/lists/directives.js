/**
 * @module np.connections.lists.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var templates       = require('text!./views/lists.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
        require('./lists-set'),
        require('./new-list'),
        require('./current-list'),
        require('./resource')
    ];

    //
    return angular.module('np.connections.lists.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templates = templateUtils.processTemplate(templates).templates;
        }])
        //
        .directive('npConnectionsLists', ['$log', '$timeout', '$rootScope', 'npConnectionsListsSet', 'npConnectionsNewList', 'npConnectionsCurrentList', function($log, $timeout, $rootScope, npConnectionsListsSet, npConnectionsNewList, npConnectionsCurrentList){
            return {
                restrict: 'A',
                scope: {},
                template: templates['lists-view'].html,
                link: function(scope, element, attrs) {
                    // Navigation
                    function Navigation() {
                        var me = this;

                        me.currentTarget = null;
                        me.prevTarget = null;

                        me.showNav = function(target, noStore) {
                            element
                                .find('[data-target="' + target + '"]')
                                .eq(0).tab('show')
                                .parent('li').removeClass('active');

                            me.prevTarget = noStore ? null : me.currentTarget;
                            me.currentTarget = target;
                        };

                        me.doNav = function(e) {
                            e.preventDefault();
                            me.showNav($(e.currentTarget).attr('data-target'));
                        };

                        me.showDesktopTab = function(target) {
                            $rootScope.$emit('np-connections-show-desktop-tab', target);
                        };
                    }

                    //
                    _.extend(scope, {
                        navigation:     new Navigation(),
                        listsSet:       new npConnectionsListsSet(),
                        newList:        new npConnectionsNewList(),
                        currentList:    new npConnectionsCurrentList()
                    }, i18n.translateFuncs);

                    function showLists() {
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.listsSet.fetch(function(){
                                scope.navigation.showNav('#np-connections-lists-lists-set');
                                done();

                                // test
                                showList(scope.listsSet.result[1]);
                                // scope.navigation.showNav('#np-connections-lists-new-list');
                            });
                        });
                    }

                    function showList(list) {
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.currentList.fetch(list, function(){
                                scope.navigation.showNav('#np-connections-lists-current-list');
                                done();
                            });
                        });
                    }

                    $rootScope.$on('np-connections-new-list', function(e, list, callback){
                        scope.listsSet.fetch(function(){
                            scope.newList.reset();
                            scope.currentList.setList(list);
                            scope.navigation.showNav('#np-connections-lists-current-list');

                            if (_.isFunction(callback)) {
                                callback();
                            }
                        });
                    });

                    $rootScope.$on('np-connections-delete-list', function(e, list, callback){
                        scope.listsSet.fetch(function(){
                            scope.navigation.showNav('#np-connections-lists-lists-set', true);

                            if (_.isFunction(callback)) {
                                callback();
                            }
                        });
                    });

                    $rootScope.$on('np-connections-do-show-lists', function(){
                        showLists();
                    });

                    $rootScope.$on('np-connections-do-show-list', function(e, list){
                        showList(list);
                    });
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
                template: templates['add-list-entries-view'].html,
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
