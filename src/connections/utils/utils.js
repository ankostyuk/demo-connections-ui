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
            return {
                requestDone: function(hasError, data, callback) {
                    if (hasError) {
                        $rootScope.$emit('np-connections-error');
                    }

                    if (_.isFunction(callback)) {
                        callback(hasError, data);
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
