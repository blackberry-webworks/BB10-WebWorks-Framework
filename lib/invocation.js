/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var self,
    globalId = 0,
    messageCallbacks = {},
    viewers = {};

function generateId() {
    var id = globalId++;
    if (!isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id;
}

self = {

    LAUNCH: 0,
    INVOKE: 1,
    VIEWER: 2,
    CHECK_FILE: 111,
    

    get startupMode() {
        var result = qnx.callExtensionMethod('invocation.startupMode');
        if (result === "VIEWER") {
            return self.VIEWER;
        } else if (result === "INVOKE") {
            return self.INVOKE;
        }
        return self.LAUNCH;
    },

    invoke: function (request, callback) {
        var id = generateId();
        if (callback) {
            messageCallbacks[id] = callback;
        }
        qnx.callExtensionMethod('invocation.invoke', id, JSON.stringify(request));
    },

    invokeViewer: function (request, callback) {
        var id = generateId();
        if (callback) {
            messageCallbacks[id] = callback;
        }
        var viewerId = 'viewer' + id;
        request.winid = viewerId;
        qnx.callExtensionMethod('invocation.invokeViewer', id, viewerId, JSON.stringify(request));
    },

    queryTargets: function (request, callback) {
        var id = generateId();
        messageCallbacks[id] = callback;
        qnx.callExtensionMethod('invocation.queryTargets', id, JSON.stringify(request));
    },

    onInvokedLegacy: function (url) {
        // FIXME: Should really fire an event for this.
    },

    onInvoked: function (request) {
        // FIXME: Should really fire an event for this.
    },

    onInvokeResponse: function (id, error) {
        var callback = messageCallbacks[id];
        if (callback) {
            messageCallbacks[id] = null;
            callback(error);
        }
    },

    onInvokeViewerResponse: function (id, error) {
        if (error) {
            var callback = messageCallbacks[id];
            delete messageCallbacks[id];
            if (callback) {
                callback(error);
            }
        }
    },

    onQueryTargetsResponse: function (id, error, response) {
        var callback = messageCallbacks[id];
        if (callback) {
            messageCallbacks[id] = null;
            callback(error, response ? JSON.parse(response) : null);
        }
    },

    onViewerCreate: function (id, viewerId) {
        var callback = messageCallbacks[id];
        delete messageCallbacks[id];
        var viewer = {
            viewerId: viewerId,
            relayCallbacks: {},

            close: function () {
                qnx.callExtensionMethod('invocation.closeViewer', this.viewerId);
                delete viewers[this.viewerId];
            },

            receive: function (id, message) {
                // FIXME: Need to handle this. Fire an event?
            },

            receiveResponse: function (message) {
                var name = message.msg;
                if (name === 'viewerCloseRequest') {
                    if (this.hasOwnProperty('onClose')) {
                        this.onClose();
                    }
                    this.close();
                } else {
                    var callback = this.relayCallbacks[id];
                    delete this.relayCallbacks[id];
                    if (callback) {
                        callback(name, message.dat);
                    }
                }
            },

            setSize: function (width, height) {
                var message = {
                    msg: 'resizeReqeust',
                    data: {
                        width: width,
                        height: height
                    }
                };
                this.send(JSON.stringify(message));
            },

            setPosition: function (x, y) {
                qnx.callExtensionMethod('invocation.setViewerPosition', this.viewerId, x, y);
            },

            setVisibility: function (visibility) {
                qnx.callExtensionMethod('invocation.setViewerVisibility', this.viewerId, visibility);
            },

            setZOrder: function (zOrder) {
                qnx.callExtensionMethod('invocation.setViewerZOrder', this.viewerId, zOrder);
            },

            send: function (message, callback) {
                var id = generateId();
                if (callback) {
                    this.relayCallbacks[id] = callback;
                }
                message.winid = this.viewerId;
                qnx.callExtensionMethod('invocation.viewerRelay', id, message);
            },

            update: function () {
                qnx.callExtensionMethod('applicationWindow.flushContext');
            },
        };
        viewers[viewer.viewerId] = viewer;
        callback(null, viewer);
    },

    onViewerRelay: function (id, message) {
        var obj = JSON.parse(message);
        var viewer = viewers[obj.viewerId];
        if (viewer) {
            viewer.receive(id, JSON.parse(obj.data));
        }
    },

    onViewerRelayResponse: function (id, response) {
        var obj = JSON.parse(response);
        var viewer = viewers[obj.viewerId];
        if (viewer) {
            viewer.receiveResponse(id, JSON.parse(obj.data));
        }
    },
};

module.exports = self;
