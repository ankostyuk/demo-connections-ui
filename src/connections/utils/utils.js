/**
 * @module np.connections.utils
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('jquery');
                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.utils', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsUtils', ['$log', '$rootScope', '$timeout', function($log, $rootScope, $timeout){
            //
            return {
                requestDone: function(hasError, args, callback) {
                    var response = {
                        data:       args[0],
                        status:     args[1],
                        headers:    args[2],
                        config:     args[3]
                    };

                    // response.status = -1 -- при принудительной отмене запросов
                    if (hasError && response.status !== -1 && response.status !== 403) {
                        $rootScope.$emit('np-connections-error');
                    }

                    if (_.isFunction(callback)) {
                        callback(hasError, response);
                    }
                },

                PaginationResult: function(options) {
                    //
                    var paginationResultDefaultPaths = {
                        list:       '_embedded.list',
                        pageInfo:   'page',
                        total:      'page.totalElements'
                    };

                    var paginationResultDefaultPageConfig = {
                        // Раскомментировать,
                        // если по умолчанию нужны параметры постраничной выдачи
                        // отличные от серверных

                        // size: 50
                    };

                    //
                    options = options || {};
                    options.paths = options.paths || _.extend({}, paginationResultDefaultPaths);
                    options.defaultPageConfig = options.defaultPageConfig || _.extend({}, paginationResultDefaultPageConfig);

                    //
                    var me                  = this,
                        _timeoutComplete    = false;

                    me.result = null;
                    me.list = null;

                    me.isShowingItemNumbers = function() {
                        return options.showingItemNumbers;
                    };

                    me.getPageList = function() {
                        return _.get(me.result, options.paths.list);
                    };

                    me.getList = function() {
                        return me.list;
                    };

                    me.getItemById = function(id) {
                        return _.find(me.getList(), {
                            id: id
                        });
                    };

                    me.getPageInfo = function() {
                        return _.get(me.result, options.paths.pageInfo);
                    };

                    me.getTotal = function() {
                        return _.get(me.result, options.paths.total);
                    };

                    me.isEmpty = function() {
                        return !me.getTotal();
                    };

                    me.firstPage = function(callback) {
                        nextPage(true, callback);
                    };

                    me.nextPage = function() {
                        nextPage(false);
                    };

                    me.hasNotNextPage = function() {
                        return !_timeoutComplete || !hasNextPage() || options.element.is(':hidden');
                    };

                    me.setResult = function(result) {
                        me.result = result;

                        var pageList = me.getPageList() || [];

                        me.list = (isFirstPageResult() || !me.list) ?
                            pageList : me.list.concat(pageList);
                    };

                    me.reset = function() {
                        me.result = null;
                        me.list = null;
                    };

                    function isFirstPageResult() {
                        var pageInfo = me.getPageInfo();

                        if (!pageInfo) {
                            return null;
                        }

                        return pageInfo.number === 0;
                    }

                    function getNextPageConfig() {
                        var pageInfo = me.getPageInfo();

                        if (!pageInfo) {
                            return options.defaultPageConfig;
                        }

                        return {
                            page: pageInfo.number + 1,
                            size: pageInfo.size
                        };
                    }

                    function hasNextPage() {
                        var pageInfo = me.getPageInfo();

                        if (pageInfo) {
                            return pageInfo.number < (pageInfo.totalPages - 1);
                        }

                        return null;
                    }

                    function nextPage(isFirstPage, callback) {
                        _timeoutComplete = false;

                        var pageConfig      = isFirstPage ? options.defaultPageConfig : getNextPageConfig(),
                            completePromise = options.doNextPage(isFirstPage, pageConfig, callback);

                        completePromise.then(function(){
                            $timeout(function(){
                                _timeoutComplete = true;
                            });
                        });
                    }
                },

                Checked: function(options) {
                    var me          = this,
                        _checked    = {};

                    me.check = function(obj) {
                        obj[options.checkedProperty] = !obj[options.checkedProperty];

                        if (obj.__checked) {
                            _checked[obj[options.idProperty]] = obj;
                        } else {
                            delete _checked[obj[options.idProperty]];
                        }
                    };

                    me.isChecked = function() {
                        return !_.isEmpty(_checked);
                    };

                    me.getCheckedCount = function() {
                        return _.size(_checked);
                    };

                    me.getChecked = function() {
                        return _checked;
                    };

                    me.resetChecked = function() {
                        _checked = {};
                    };
                }
            };
        }]);
    //
});
