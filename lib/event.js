/*
 *  Copyright 2012 Research In Motion Limited.
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

var _handlers = {};

module.exports = {
    trigger: function (actionEvent) {
        var args = Array.prototype.slice.call(arguments);

        if (_handlers.hasOwnProperty(actionEvent)) {
            _handlers[actionEvent].forEach(function (webviewId) {
                var webview = window.qnx.webplatform.createWebView({WebViewId: webviewId});
                webview.executeJavaScript("webworks.event.trigger('" + actionEvent + "', '" + encodeURIComponent(JSON.stringify(args.slice(1))) + "')");
            });
        }
    },

    add: function (action, webviewId) {
        if (action) {
            action.context.addEventListener(action.event, action.trigger || this.trigger);

            //If there are no registered listeners for this event, create an array to hold them
            if (!_handlers.hasOwnProperty(action.event)) {
                _handlers[action.event] = [];
            }
            //If the webviewId is not in the list of webviews listening to this action then add it
            if (_handlers[action.event].indexOf(webviewId) === -1) {
                _handlers[action.event].push(webviewId);
            }

        } else {
            throw "Action is null or undefined";
        }
    },

    remove: function (action, webviewId) {
        if (action) {
            action.context.removeEventListener(action.event, action.trigger || this.trigger);

            //Remove the webviewId from the _handlers
            if (_handlers.hasOwnProperty(action.event)) {

                _handlers[action.event] = _handlers[action.event].filter(function (id) {
                    return id !== webviewId;
                });


                //If the array is empty delete it
                if (_handlers[action.event].length === 0) {
                    delete _handlers[action.event];
                }
            }

        } else {
            throw "Action is null or undefined";
        }

    }
};
