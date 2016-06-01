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

    // for encoding user file
                          require('text-encoding');
    var jschardet       = require('jschardet');


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
                                // $rootScope.$emit('np-connections-show-list', scope.listsSet.result.getList()[1]);
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

                    $rootScope.$on('np-connections-new-list', function(e, newList, callback){
                        scope.listsSet.fetch(function(){
                            var fetchedList = _.find(scope.listsSet.result.getList(), function(list){
                                return list.id === newList.id;
                            });

                            var list = fetchedList || newList;

                            scope.currentList.fetch(list, function(){
                                scope.newList.reset();
                                scope.navigation.showNav('#np-connections-lists-current-list');

                                if (_.isFunction(callback)) {
                                    callback();
                                }
                            });
                        });
                    });

                    $rootScope.$on('np-connections-list-add-entries', function(e, addedEntriesInfo, callback){
                        scope.currentList.fetchEntries(function(){
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
                        text: null,
                        file: null,
                        isAddActionReady: function() {
                            return _.get(scope, 'proxy.addActionEnabled') &&
                                ((scope.target === 'text' && scope.text) || scope.target === 'file');
                        },
                        reset: function() {
                            resetText();
                            resetFile();
                            resetTarget();
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
                            $rootScope.$emit('np-connections-loading', function(done){
                                addEntries(function(hasError, response){
                                    if (hasError) {
                                        done();
                                    } else {
                                        $rootScope.$emit('np-connections-list-add-entries', response.data, function(){
                                            scope.reset();
                                            done();
                                        });
                                    }
                                });
                            });
                        }
                    });

                    _.extend(scope.proxy, {
                        addEntries: function(callback) {
                            addEntries(callback);
                        },
                        reset: function() {
                            scope.reset();
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
                        fileReader.readAsArrayBuffer(file);

                        scope.file = file;
                    }

                    fileReader.onload = function(e) {
                        if (scope.fileLoad) {
                            scope.doTarget('file');
                            scope.$apply();
                        }
                    };

                    function getFileText() {
                        try {
                            var array           = new Uint8Array(fileReader.result),
                                encodingInfo    = jschardet.detect(String.fromCharCode.apply(null, array)),
                                decoder         = new TextDecoder(encodingInfo.encoding);

                            return decoder.decode(array);
                        } catch (e) {
                           $log.error('getFileText... error:', e);
                           return null;
                        }
                    }

                    function resetText() {
                        scope.text = null;
                    }

                    function resetFile() {
                        resetFileReader();
                        scope.file = null;
                        formElement.get(0).reset();
                    }

                    function resetFileReader() {
                        fileReader.abort();
                        scope.fileLoad = false;
                    }

                    function resetTarget() {
                        scope.doTarget(null);
                    }

                    function addEntries(callback) {
                        if (!scope.target) {
                            callback();
                            return;
                        }

                        var text = scope.text;

                        if (scope.target === 'file') {
                            text = getFileText();

                            if (!text) {
                                // TODO сообщение: "Не удалось прочитать ваш файл <scope.file.name>"
                                alert('Не удалось прочитать ваш файл ' + scope.file.name);
                                callback(true);
                                return;
                            }
                        }

                        var userDataList = _.filter(
                            _.lines(text),
                            function(userData) {
                                return !_.isBlank(userData);
                            }
                        );

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
