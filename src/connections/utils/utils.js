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
        .factory('npConnectionsUtils', ['$log', '$rootScope', function($log, $rootScope){
            //
            var paginationResultDefaultPaths = {
                listPath: '_embedded.list',
                pageInfoPath: 'page',
                totalPath: 'page.totalElements'
            };

            //
            return {
                requestDone: function(hasError, args, callback) {
                    var response = {
                        data:       args[0],
                        status:     args[1],
                        headers:    args[2],
                        config:     args[3]
                    };

                    if (hasError && response.status !== 403) {
                        $rootScope.$emit('np-connections-error');
                    }

                    if (_.isFunction(callback)) {
                        callback(hasError, response);
                    }
                },

                getPaginationResultDefaultPaths: function(options) {
                    return paginationResultDefaultPaths;
                },

                PaginationResult: function(options) {
                    options = options || _.extend({}, paginationResultDefaultPaths);

                    var me = this;

                    me.result = null;

                    me.setResult = function(result) {
                        me.result = result;
                    };

                    me.getList = function() {
                        return _.get(me.result, options.listPath);
                    };

                    me.getPageInfo = function() {
                        return _.get(me.result, options.pageInfoPath);
                    };

                    me.getTotal = function() {
                        return _.get(me.result, options.totalPath);
                    };

                    me.isEmpty = function() {
                        return !me.getTotal();
                    };

                    me.reset = function() {
                        me.result = null;
                    };
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
