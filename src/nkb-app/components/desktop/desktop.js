//
define(function(require, exports, module) {'use strict';

                          require('less!./styles/desktop');
    var template        = require('text!./views/desktop.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

    //
    return angular.module('app.desktop', [])
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('appDesktop', [function(){
            return {
                restrict: 'A',
                template: template,
                scope: false,
                link: function(scope, element, attrs) {
                    // Tab
                    var tabElement = element.find('.desktop-tab');

                    tabElement.find('> li > a').click(function(e){
                        e.preventDefault();
                        $(this).tab('show');
                    });
                }
            };
        }]);
    //
});
