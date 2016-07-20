/**
 * @module np.connections.widgets.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('less!./styles/widgets');

    var templates = {
        'node-favorites': require('text!./views/node-favorites.html')
    };

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
        require('connections/lists/resource'),
        require('connections/lists/resource'),
        require('connections/utils/utils')
    ];

    //
    return angular.module('np.connections.widgets.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = templateUtils.processTemplate(template).templates;
            });
        }])
        //
        .directive('npConnectionsWidgetsNodeFavorites', ['$log', '$rootScope', '$timeout', '$q', 'npUtils', 'npConnectionsListsResource', 'npConnectionsUtils', function($log, $rootScope, $timeout, $q, npUtils, npConnectionsListsResource, npConnectionsUtils){
            return {
                restrict: 'A',
                scope: {
                    node: "=npConnectionsWidgetsNodeFavorites"
                },
                template: templates['node-favorites']['favorites-view'].html,
                //
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    var scope   = $scope,
                        element = $element,
                        attrs   = $attrs;

                    //
                    _.extend(scope, {
                        loader: {}, // см. directive npLoader
                        loading: function(operation) {
                            var completer = $q.defer();

                            npUtils.loading(
                                operation,
                                function(){
                                    scope.loader.show();
                                },
                                function(){
                                    scope.loader.hide();
                                    completer.resolve();
                                },
                            500);

                            return completer.promise;
                        }
                    });
                }],
                //
                link: function(scope, element, attrs) {

                    var listsPopupElement   = element.find('.lists-popup'),
                        listsSelectElement  = element.find('.lists-popup .lists-select'),
                        newListInputElement = element.find('.lists-popup .new-list'),
                        toggled             = false,
                        lastListId          = null;

                    //
                    $('html').click(function(e){
                        if (!toggled) {
                            if (scope.hideListsPopup()) {
                                scope.$apply();
                            }
                        }
                        toggled = false;
                    });

                    listsPopupElement.click(function(e){
                        // e.preventDefault();
                        e.stopPropagation();
                    });

                    //
                    _.extend(scope, {
                        includesNodeUserList: includesNodeUserList,
                        inFavorites: function() {
                            return !!getNodeUserListsSize();
                        },
                        toggleListsPopup: function() {
                            toggled = true;
                            scope.listsPopupShow = !scope.listsPopupShow;

                            if (scope.listsPopupShow) {
                                onShowListsPopup();
                            } else {
                                onHideListsPopup();
                            }
                        },
                        hideListsPopup: function() {
                            var show = scope.listsPopupShow;
                            scope.listsPopupShow = false;
                            var changed = (show !== scope.listsPopupShow);

                            if (changed) {
                                onHideListsPopup();
                            }

                            return changed;
                        },
                        isNoLists: function() {
                            return listsResult.isEmpty();
                        },
                        getUserLists: function() {
                            return listsResult.getList();
                        },
                        addToList: function() {
                            doAddToList();
                        },
                        addToNewList: function() {
                            doAddToNewList();
                        },
                        setMode: function(mode) {
                            scope.mode = mode;

                            $timeout(function(){
                                if (mode === 'LISTS') {
                                    listsSelectElement.focus();
                                } else
                                if (mode === 'NEW_LIST') {
                                    newListInputElement.focus();
                                }
                            });
                        }
                    });

                    function onShowListsPopup() {
                        doLists();
                    }

                    function onHideListsPopup() {
                        _.each(
                            [nodesListsRequest, listsRequest],
                            function(request){
                                if (request) {
                                    request.abort();
                                }
                            }
                        );
                    }

                    function getNodeUserListsSize() {
                        return _.size(getNodeUserLists());
                    }

                    function getNodeUserLists() {
                        return _.get(scope.node, '_connections.userLists');
                    }

                    function setNodeUserLists(userLists) {
                        _.set(scope.node, '_connections.userLists', userLists);
                    }

                    function setNodeUserList(list) {
                        var userLists = _.get(scope.node, '_connections.userLists');

                        if (!userLists) {
                            userLists = [];
                            setNodeUserLists(userLists);
                        }

                        userLists.push(list);
                    }

                    function includesNodeUserList(listId) {
                        return !!_.find(getNodeUserLists(), {
                            id: listId
                        });
                    }

                    function getNodeData() {
                        var node = scope.node;

                        if (node._type === 'COMPANY') {
                            return node['okpo'];
                        }
                        if (node._type === 'INDIVIDUAL') {
                            return node['name'];
                        }
                    }

                    function doLists() {
                        scope.loading(function(done){
                            fetchNodesLists(done);
                        });
                    }

                    function doAddToList() {
                        scope.loading(function(done){
                            var list = listsResult.getItemById(scope.selectedListId);
                            addListEntries(list, done);
                        });
                    }

                    function doAddToNewList() {
                        scope.loading(function(done){
                            createList(done);
                        });
                    }

                    //
                    //
                    //
                    var nodesListsRequest = null;

                    function fetchNodesLists(callback) {
                        nodesListsRequest = npConnectionsListsResource.nodesLists({
                            data: [{
                                type: scope.node._type,
                                id: scope.node._id,
                            }],
                            success: function(data) {
                                doNodesListsResult(data);
                                listsResult.firstPage(callback);
                            },
                            error: function() {
                                npConnectionsUtils.requestDone(true, arguments, callback);
                            },
                            previousRequest: nodesListsRequest
                        });
                    };

                    function doNodesListsResult(result) {
                        var userLists = _.head(result);
                        setNodeUserLists(userLists);
                    }

                    //
                    var listsRequest = null;

                    var listsResult = new npConnectionsUtils.PaginationResult({
                        defaultPageConfig: {
                            size: 100 // TODO
                        },
                        doNextPage: function(isFirstPage, pageConfig, callback) {
                            if (isFirstPage) {
                                return fetchLists(pageConfig, callback).completePromise;
                            }

                            return listsRequest.completePromise;
                        }
                    });

                    function fetchLists(pageConfig, callback) {
                        listsRequest = npConnectionsListsResource.lists({
                            params: pageConfig,
                            success: function(data) {
                                listsResult.reset();
                                listsResult.setResult(data);
                                doListsResult();
                                npConnectionsUtils.requestDone(false, arguments, callback);
                            },
                            error: function() {
                                npConnectionsUtils.requestDone(true, arguments, callback);
                            },
                            previousRequest: listsRequest
                        });

                        return listsRequest;
                    }

                    function doListsResult() {
                        var lastListIdExist     = false,
                            firstSelectedListId = null;

                        _.each(listsResult.getList(), function(list){
                            list.__isNode = includesNodeUserList(list.id);

                            if (firstSelectedListId === null && list.__isNode) {
                                firstSelectedListId = list.id;
                            }

                            if (!lastListIdExist && list.id === lastListId) {
                                lastListIdExist = true;
                            }
                        });

                        scope.selectedListId = lastListIdExist ? lastListId : (firstSelectedListId ? firstSelectedListId : 'null');
                    }

                    //
                    var addEntriesListRequest = null;

                    function addListEntries(list, callback) {
                        addEntriesListRequest = npConnectionsListsResource.createListEntries({
                            listId: list.id,
                            data: [getNodeData()],
                            success: function(data) {
                                doNodeToListResult(list);
                                npConnectionsUtils.requestDone(false, arguments, callback);
                            },
                            error: function() {
                                npConnectionsUtils.requestDone(true, arguments, callback);
                            },
                            previousRequest: addEntriesListRequest
                        });
                    }

                    function doNodeToListResult(list) {
                        setNodeUserList(list);
                        doListsResult();
                        scope.hideListsPopup();
                        reset();
                        lastListId = list.id;
                    }

                    //
                    var createListRequest = null;

                    function createList(callback) {
                        createListRequest = npConnectionsListsResource.createList({
                            data: {
                                name: scope.newListName,
                                type: scope.node._type
                            },
                            success: function(list) {
                                addListEntries(list, callback);
                            },
                            error: function() {
                                npConnectionsUtils.requestDone(true, arguments, callback);
                            },
                            previousRequest: createListRequest
                        });
                    };

                    //
                    //
                    //

                    function reset() {
                        _.extend(scope, {
                            mode: 'LIST',
                            newListName: null
                        });
                    }

                    reset();
                }
            };
        }]);
    //
});
