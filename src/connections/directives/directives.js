/**
 * @module directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO перенести в [commons-js](https://github.com/newpointer/commons-js)
//
define(function(require, exports, module) {'use strict';

                          require('less!./styles/directives');

    var template        = require('text!./views/directives.html'),
        templateData, viewTemplates;

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [];

    //
    return angular.module('np.connections.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templateData    = templateUtils.processTemplate(template);
            viewTemplates   = templateData.templates;
        }])
        //
        .directive('npInlineEdit', ['$log', '$timeout', function($log, $timeout){
            return {
                restrict: 'A',
                scope: {
                    model: '=npInlineEdit',
                    proxy: '=proxy',
                    data: '=data'
                },
                template: viewTemplates['inline-edit'].html,
                link: function(scope, element, attrs) {
                    $log.info('* npInlineEdit... scope:', scope);

                    var inputElement  = element.find('.inline-edit-input input');

                    //
                    inputElement.keyup(function(e){
                        // esc
                        if (e.keyCode === 27) {
                            scope.$apply(function(){
                                scope.off();
                            });
                        } else
                        // enter
                        if (e.keyCode === 13) {
                            scope.$apply(function(){
                                scope.edit();
                            });
                        }
                    });

                    //
                    _.extend(scope, {
                        active: false,
                        on: function() {
                            initText();

                            scope.active = true;
                            element.addClass('active');

                            $timeout(function(){
                                inputElement.focus();
                            });
                        },
                        off: function() {
                            scope.active = false;
                            element.removeClass('active');
                        },
                        edit: function() {
                            scope.off();

                            if (scope.newText === scope.oldText) {
                                return;
                            }

                            if (_.isFunction(scope.proxy.onEdit)) {
                                scope.proxy.onEdit(scope.newText, scope.oldText, scope.data);
                            }
                        }
                    });

                    _.extend(scope.proxy, {
                        off: function() {
                            scope.off();
                        }
                    });

                    function initText() {
                        var text = '' + scope.model;
                        scope.oldText = text;
                        scope.newText = text;
                    }
                }
            };
        }]);
    //
});
