/**
 * @module np.connections.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var templates = {
        'connections':          require('text!./views/connections.html')
    };

    var externalTemplates = {
        'np-rsearch-node-info': require('text!../../external_components/nullpointer-rsearch/rsearch/views/rsearch-node-info.html')
    };

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = templateUtils.processTemplate(template).templates;
            });

            _.each(externalTemplates, function(template, name){
                externalTemplates[name] = i18n.translateTemplate(template);
            });
        }])
        //
        .directive('npConnectionsChecked', ['$log', function($log){
            return {
                restrict: 'A',
                scope: {
                    obj: '=npConnectionsChecked',
                    check: '&npConnectionsCheckedCheck'
                },
                template: templates['connections']['checked-view'].html
            };
        }])
        //
        .directive('npConnectionsNodeInfo', ['$log', function($log){
            return {
                restrict: 'A',
                scope: {
                    node: '=npConnectionsNodeInfo'
                },
                template: externalTemplates['np-rsearch-node-info']
            };
        }]);
    //
});
