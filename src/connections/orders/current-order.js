/**
 * @module np.connections.current-order
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular'),
        download        = require('download');

    var angularModules = [
        require('./resource')
    ];

    //
    return angular.module('np.connections.current-order', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsCurrentOrder', ['$log', '$rootScope', '$timeout', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, $timeout, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me          = this,
                    _request    = null;

                me.order = null;

                //
                me.nodeTracesView = null;
                me.nodeTracesNodes = null;
                me.nodeTracesCurrentPair = null;

                var _tracesDataSource = {
                    reverse: true,
                    srcInTrace: false,
                    depths: null,
                    tracesRequest: _.noop,
                    nodeClick: _.noop,
                    applyResult: _.noop,
                    doTrace: function(traceIndex) {
                        // ?
                    }
                };

                me.setNodeTracesView = function(nodeTracesView) {
                    me.nodeTracesView = nodeTracesView;
                    nodeTracesView.setDataSource(_tracesDataSource);
                };

                me.doNodePairTracesResult = function(pairIndex) {
                    if (me.nodeTracesCurrentPair === pairIndex) {
                        return;
                    }
                    buildNodePairTracesResult(pairIndex);
                    me.nodeTracesCurrentPair = pairIndex;
                };

                function buildNodeTraces() {
                    if (!me.isResult()) {
                        return;
                    }

                    me.nodeTracesNodes = _.pluck(me.getResultEntries(), 'node');

                    me.doNodePairTracesResult(0);
                    me.nodeTracesView.toggle(true);

                    // test
                    // buildResultText();
                }

                function buildNodePairTracesResult(pairIndex) {
                    var pair        = me.getResultPair(pairIndex),
                        firstNode   = me.getResultEntry(pair.first).node,
                        secondNode  = me.getResultEntry(pair.second).node,
                        filters     = {},
                        traceIndex  = 0;

                    var nodeTracesResult = {
                        nodes: me.nodeTracesNodes,
                        traces: pair.traces,
                        relations: []
                    };

                    me.nodeTracesView.setResult([firstNode, secondNode], filters, nodeTracesResult, traceIndex, false);
                }

                function resetNodeTraces() {
                    if (!me.nodeTracesView) {
                        return;
                    }

                    me.nodeTracesView.toggle(false);
                    me.nodeTracesView.reset();
                    me.nodeTracesNodes = null;
                    me.nodeTracesCurrentPair = null;
                }

                //
                me.getListCount = function() {
                    return _.size(_.get(me.order, 'userLists'));
                };

                me.getResultPairs = function() {
                    return _.get(me.order, 'result.pairs');
                };

                me.getResultPair = function(index) {
                    return _.get(me.getResultPairs(), index);
                };

                me.isEmptyResult = function() {
                    return _.get(me.order, 'status') === 'READY' && _.isEmpty(me.getResultPairs());
                };

                me.isResult = function() {
                    return _.get(me.order, 'status') === 'READY' && !_.isEmpty(me.getResultPairs());
                };

                me.getResultEntries = function() {
                    return _.get(me.order, 'result.entries');
                };

                me.getResultEntry = function(index) {
                    return _.get(me.getResultEntries(), index);
                };

                me.fetch = function(order, callback) {
                    me.order = order;
                    reset();
                    me.fetchOrder(callback);
                };

                me.fetchOrder = function(callback) {
                    _request = npConnectionsOrdersResource.order({
                        id: me.order.id,
                        success: function(data) {
                            _.extend(me.order, data);

                            buildNodeTraces();

                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });
                };

                function reset() {
                    me.order.result = null;
                    resetNodeTraces();
                }

                //
                // export
                //
                me.doExportResult = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        $timeout(function(){
                            // download(buildResultText(), 'connections-result.txt', 'text/plain');
                            download(buildResultText(), 'connections-result.doc', 'application/msword');
                            done();
                        }, 1000);
                    });
                };

                // function __buildResultText() {
                //     var resultText = ''
                //         + 'Результат проверки связей\r\n'
                //         + '--------------------------------------------------------------------------------\r\n'
                //         + '\r\n'
                //         + (_.size(me.order.userLists) === 1 ? 'В списке\r\n' : 'В списках\r\n')
                //         + '\r\n'
                //         + '';
                //
                //     _.each(me.order.userLists, function(userList){
                //         resultText += userList.name + '\r\n';
                //     });
                //
                //     resultText += ''
                //         + '\r\n'
                //         + 'связаны...'
                //         + '\r\n'
                //         + '';
                //
                //     _.each(me.getResultPairs(), function(pair){
                //         var firstNode   = me.getResultEntry(pair.first).node,
                //             secondNode  = me.getResultEntry(pair.second).node,
                //             filters     = {},
                //             traceIndex  = 0;
                //
                //         var nodeTracesResult = {
                //             nodes: me.nodeTracesNodes,
                //             traces: pair.traces,
                //             relations: []
                //         };
                //
                //         resultText += ''
                //             + '\r\n'
                //             + me.nodeTracesView.buildResultText([firstNode, secondNode], nodeTracesResult)
                //             + '\r\n'
                //             + '--------------------------------------------------------------------------------\r\n'
                //             + '';
                //     });
                //
                //     resultText += ''
                //         + '© 2016 Национальное кредитное бюро\r\n'
                //         + '+7 495 229-67-47\r\n'
                //         + 'www.creditnet.ru\r\n'
                //         + '';
                //
                //     // $log.warn('resultText', '\n', resultText);
                //
                //     return resultText;
                // }

                function buildResultText() {
                    var resultText = ''
                        + '<body>'
                        + '<h1>Результат проверки связей</h1>'
                        + '<br>'
                        + (_.size(me.order.userLists) === 1 ? 'В списке' : 'В списках')
                        + '<br>'
                        + '';

                    _.each(me.order.userLists, function(userList){
                        resultText += ('<h2>' + userList.name + '</h2>');
                    });

                    resultText += ''
                        + '<br>'
                        + 'связаны...'
                        + '<br>'
                        + '';

                    _.each(me.getResultPairs(), function(pair){
                        var firstNode   = me.getResultEntry(pair.first).node,
                            secondNode  = me.getResultEntry(pair.second).node,
                            filters     = {},
                            traceIndex  = 0;

                        var nodeTracesResult = {
                            nodes: me.nodeTracesNodes,
                            traces: pair.traces,
                            relations: []
                        };

                        resultText += ''
                            // + '<br>'
                            + me.nodeTracesView.buildResultText([firstNode, secondNode], nodeTracesResult)
                            + '<br>'
                            + '<hr>'
                            + '';
                    });

                    resultText += ''
                        + '<i>© 2016 Национальное кредитное бюро</i><br>'
                        + '<i>+7 495 229-67-47</i><br>'
                        + '<a href="http://www.creditnet.ru"><i>www.creditnet.ru</i></a><br>'
                        + '</body>'
                        + '';

                    // $log.warn('resultText', '\n', resultText);

                    return resultText;
                }
            };
        }]);
    //
});
