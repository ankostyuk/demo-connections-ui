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
    ];

    //
    return angular.module('np.connections.lists.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templates = templateUtils.processTemplate(templates).templates;
        }])
        //
        .directive('npConnectionsLists', ['$log', '$timeout', '$rootScope', 'npConnectionsListsSet', 'npConnectionsNewList', 'npConnectionsCurrentList', 'npConnectionsNavigation', function($log, $timeout, $rootScope, npConnectionsListsSet, npConnectionsNewList, npConnectionsCurrentList, npConnectionsNavigation){
            return {
                restrict: 'A',
                scope: {},
                template: templates['lists-view'].html,
                link: function(scope, element, attrs) {
                    //
                    var newListNameInput = element.find('.new-list input.list-name');

                    //
                    var navOptions = {
                        element: element,
                        markActive: false,
                        targets: {
                            '#np-connections-lists-new-list': {
                                after: function(targetProxy) {
                                    if (!scope.newList.isReady()) {
                                        newListNameInput.focus();
                                    }
                                }
                            }
                        }
                    };

                    _.extend(scope, {
                        navigation:     new npConnectionsNavigation(navOptions),
                        listsSet:       new npConnectionsListsSet(),
                        newList:        new npConnectionsNewList(),
                        currentList:    new npConnectionsCurrentList()
                    }, i18n.translateFuncs);

                    //
                    $rootScope.$on('np-connections-show-lists', function(e, callback){
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.listsSet.fetch(function(hasError, response){
                                scope.navigation.showNav('#np-connections-lists-lists-set');

                                if (_.isFunction(callback)) {
                                    callback(hasError, response);
                                }

                                done();

                                // test
                                $rootScope.$emit('np-connections-show-list', scope.listsSet.result.getList()[1]);
                            });
                        });
                    });

                    $rootScope.$on('np-connections-show-list', function(e, list){
                        $rootScope.$emit('np-connections-loading', function(done){
                            scope.currentList.fetch(list, function(){
                                scope.navigation.showNav('#np-connections-lists-current-list');
                                done();
                            });
                        });
                    });

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
                }
            };
        }])
        //
        .directive('npConnectionsListsAddListEntries', ['$log', '$timeout', '$rootScope', 'npConnectionsListsResource', 'npConnectionsUtils', function($log, $timeout, $rootScope, npConnectionsListsResource, npConnectionsUtils){
            return {
                restrict: 'A',
                scope: {
                    proxy: '=npConnectionsListsAddListEntries'
                },
                template: templates['add-list-entries-view'].html,
                link: function(scope, element, attrs) {
                    //
                    var formElement         = element.find('form'),
                        fileElement         = element.find('.add-file input'),
                        textElement         = element.find('textarea'),
                        fileReader          = new FileReader(),
                        addEntriesRequest   = null;

                    //
                    _.extend(scope, {
                        target: null,
                        text: 'Костюк Андрей Григорьевич',
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
                        },
                        doAdd: function() {
                            // TODO Charset: UTF8, CP1251, ...
                            // https://github.com/aadsm/jschardet

                            $log.info('* doAdd', scope.target);
                            // $log.info('< text', scope.text);
                            // $log.info('< file', scope.file);

                            var userDataList = _.compact(
                                _.lines(scope.target === 'text' ? scope.text : fileReader.result)
                            );

                            $log.info('< userDataList:\n', userDataList);

                            $rootScope.$emit('np-connections-loading', function(done){
                                addEntries(userDataList, function(hasError, response){
                                    done();
                                    // if (hasError) {
                                    //     done();
                                    // } else {
                                    //     $rootScope.$emit('np-connections-new-list', list, done);
                                    // }
                                });
                            });
                        }
                    });

                    //
                    fileElement.change(function(e){
                        scope.$apply(doFile());
                    });

                    function doFile() {
                        resetFileReader();

                        var file = _.get(fileElement.get(0), 'files[0]');

                        if (!file) {
                            return;
                        }

                        scope.fileLoad = true;
                        fileReader.readAsText(file);

                        scope.file = file;
                    }

                    fileReader.onload = function(e) {
                        if (scope.fileLoad) {
                            scope.doTarget('file');
                            scope.$apply();
                        }
                    };

                    function resetFile() {
                        resetFileReader();
                        scope.file = null;
                        formElement.get(0).reset();
                    }

                    function resetFileReader() {
                        scope.fileLoad = false;
                    }

                    function resetTarget() {
                        scope.doTarget(null);
                    }

                    function addEntries(userDataList, callback) {
                        addEntriesRequest = npConnectionsListsResource.createListEntries({
                            listId: scope.proxy.getListId(),
                            data: userDataList,
                            success: function(data) {
                                npConnectionsUtils.requestDone(false, arguments, callback);
                            },
                            error: function() {
                                npConnectionsUtils.requestDone(true, arguments, callback);
                            },
                            previousRequest: addEntriesRequest
                        });
                    }
                }
            };
        }]);
    //
});
