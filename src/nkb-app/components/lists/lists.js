//
define(function(require, exports, module) {'use strict';

                          require('less!./styles/lists');
    var template        = require('text!./views/lists.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

                          require('np.resource');

    //
    return angular.module('app.lists', ['np.resource'])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .factory('appListsResource', ['$log', 'appConfig', 'npResource', function($log, appConfig, npResource){

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
        .directive('appLists', ['$log', 'appListsResource', function($log, appListsResource){
            return {
                restrict: 'A',
                template: template,
                scope: false,
                link: function(scope, element, attrs) {
                    appListsResource.lists({
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
