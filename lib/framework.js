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
    chromeWebview = utils.requireChromeWebview(),
    config = require("./config"),
    onPause = null,
    onResume = null;

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

function setupControllerWebView() {
    var controller = window.qnx.webplatform.getController();
    controller.enableWebInspector = config.debugEnabled;
    controller.enableCrossSiteXHR = true;
    controller.visible = true;
    controller.active = false;
    controller.setGeometry(0, 0, screen.width, screen.height);

    window.qnx.webplatform.getApplicationWindow().visible = true;

    // TODO: Move to webplatform webview.js
    qnx.callExtensionMethod("webview.setBackgroundColor", controller.id, "0x00FFFFFF");
    qnx.callExtensionMethod("webview.setSensitivity", controller.id, "SensitivityTest");
}

var _self = {
    start: function (url) {
        // Set up the controller WebView
        setupControllerWebView();

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
        });
        
    },
    stop: function () {
        webview.destroy();
    },
    setOnPause: function (handler) {
        onPause = handler;
    },
    setOnResume: function (handler) {
        onResume = handler;
    }
};

module.exports = _self;
