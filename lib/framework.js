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

var utils = require('./utils'),
    webview = utils.requireWebview(),
    config = require("./config"),
    onPause = null,
    onResume = null,
    onInvoked = null;

function registerNavigatorEvents() {
    if (window.chrome && window.chrome.internal) {
        chrome.internal.navigator = {};
        chrome.internal.navigator.onWindowState = function (state) {};
        chrome.internal.navigator.onWindowActive = function () {
            if (onResume) {
                onResume();
            }            
        };
        chrome.internal.navigator.onWindowInactive = function () {
            if (onPause) {
                onPause();
            }            
        };
    }
}

function registerInvocationEvents() {
    var fieldsToBlob;

    if (window.chrome && window.chrome.internal) {
        chrome.internal.invocation = chrome.internal.invocation || {};
        chrome.internal.invocation.onInvoked = function (onInvokedInfo) {
            onInvokedInfo = JSON.parse(onInvokedInfo);

            if (typeof onInvoked === 'function') {
                // Object can have several fields with different encoding that need to become blob as a result
                // there is a helper fieldToBlob object that provides that information in a way that
                // each object's property that matches one from fieldsToBlob will be reprecented as a Blob, after being decoded if required.
                if (onInvokedInfo.data) {
                    fieldsToBlob = {"data": "base64"};
                }
                
                onInvoked(onInvokedInfo, fieldsToBlob);
            }
        };
    }
}

var _self = {
    start: function (url) {
        registerInvocationEvents();

        webview.create(function () {
            // Workaround for executeJavascript doing nothing for the first time
            webview.executeJavascript("1 + 1");

            url = url || config.content;
            // Start page
            if (url) {
                webview.setURL(url);
            }

            // Define navigator events callbacks which get invoked by native code
            registerNavigatorEvents();
        },
        {
            debugEnabled : config.debugEnabled
        }
        );
    },
    stop: function () {
        webview.destroy();
    },
    setOnPause: function (handler) {
        onPause = handler;
    },
    setOnResume: function (handler) {
        onResume = handler;
    },
    setOnInvoked: function (handler) {
        onInvoked = handler;
    }
};

module.exports = _self;
