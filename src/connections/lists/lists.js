/**
 * @module lists
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var template        = require('text!./views/lists.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('np.resource');

    //
    return angular.module('np.connections.lists', ['np.resource'])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
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
                template: template,
                scope: false,
                link: function(scope, element, attrs) {
                    npConnectionsListsResource.lists({
                        success: function(data){
                            $log.info('getting lists...', data);
                        },
                        error: function(){
                            $log.warn('getting lists... error');
                        }
                    });
                }
            };
        }]);
    //
});
