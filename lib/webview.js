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

var request = require('./request'),
    utils = require('./utils'),
    config = require('./config'),
    permissions = require('./permissions'),
    CHROME_HEIGHT = 0,
    OUT_OF_PROCESS = 1,
    LOCAL_URI = "local://",
    FILE_URI = "file://",
    webview,
    _webviewObj;

function enableWhitelisting(id) {
    var accessElements = config.accessList;

    accessElements.forEach(function (element, index, array) {
        var uri = element.uri,
            parsedURI;

        //Local case
        if (uri === 'WIDGET_LOCAL' && element.features && element.features.length) {
            //Add access from local for APIs
            qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, LOCAL_URI, utils.getURIPrefix(), true);

            //Always allow file access from local and let the OS deal with permissions
            qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, LOCAL_URI, FILE_URI, true);
            qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, FILE_URI, LOCAL_URI,  true);
        } else {
            parsedURI = utils.parseUri(uri);
            //TODO: Find a way to have access URIs with file:// to be given universal access
            if (!utils.isFileURI(parsedURI)) {
                //TODO: Find a way for all domains to access the element
                //Dirty Hack - Allow access to local and file
                qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, uri, LOCAL_URI, element.allowSubDomain);
                qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, LOCAL_URI, uri, element.allowSubDomain);
                qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, uri, FILE_URI, element.allowSubDomain);
                qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, FILE_URI, uri, element.allowSubDomain);
                if (element.features && element.features.length) {
                    qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, uri, utils.getURIPrefix(), true);
                }
            }
        }
    });

    if (config.hasMultiAccess) {
        //TODO: Find the cases that access=* should cover and are not met by webkit
        //Give startup page access to file and local incase it wasn't given it previously
        qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, config.content, FILE_URI, true);
        qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, FILE_URI, config.content, true);
        qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, config.content, LOCAL_URI, true);
        qnx.callExtensionMethod('webview.addOriginAccessWhitelistEntry', id, LOCAL_URI, config.content, true);
    }


}

webview =
    {
    create: function (ready) {
        _webviewObj = window.qnx.webplatform.createWebView({processType: OUT_OF_PROCESS, defaultHandlers: ['onChooseFile']}, function () {
            var requestObj = request.init(_webviewObj);

            _webviewObj.visible = true;
            _webviewObj.active = true;
            _webviewObj.zOrder = 0;
            enableWhitelisting(_webviewObj.id);
            _webviewObj.setGeometry(0, CHROME_HEIGHT, screen.width, screen.height - CHROME_HEIGHT);

            if (config.backgroundColor) {
                _webviewObj.backgroundColor = config.backgroundColor;
            }
            _webviewObj.autoDeferNetworkingAndJavaScript = config.autoDeferNetworkingAndJavaScript;

            /* Catch and trigger our custom HTML dialog */
            _webviewObj.enableDialogRequestedEvents = true;

            // Enable the permissions checking for this webview, traps any native permission events
            // coming from native
            permissions.init(webview);
            _webviewObj.onGeolocationPermissionRequest = permissions.onGeolocationPermissionRequest;

            _webviewObj.addEventListener("DocumentLoadFinished", function () {
                window.qnx.webplatform.getApplication().windowVisible = true;
            });

            _webviewObj.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;
            _webviewObj.onUnknownProtocol = requestObj.unknownProtocolHandler;

            if (ready && typeof ready === 'function') {
                ready();
            }

            // After 12 second, hide the splash screen and show application window even "DocumentLoadFinished" event is not fired
            setTimeout(function () {
                window.qnx.webplatform.getApplication().windowVisible = true;
            }, 12000);
        });
    },

    destroy: function () {
        _webviewObj.destroy();
    },

    setURL: function (url) {
        _webviewObj.url = url;
    },

    executeJavascript: function (js) {
        _webviewObj.executeJavaScript(js);
    },

    addEventListener: function (eventName, callback) {
        _webviewObj.addEventListener(eventName, callback);
    },

    removeEventListener: function (eventName, callback) {
        _webviewObj.removeEventListener(eventName, callback);
    },

    windowGroup: function () {
        return _webviewObj.windowGroup;
    },

    setGeometry: function (x, y, width, height) {
        _webviewObj.setGeometry(x, y, width, height);
    },

    setApplicationOrientation: function (angle) {
        _webviewObj.setApplicationOrientation(angle);
    },

    setExtraPluginDirectory: function (directory) {
        _webviewObj.setExtraPluginDirectory(directory);
    },

    setEnablePlugins: function (enablePlugins) {
        _webviewObj.pluginsEnabled = enablePlugins;
    },

    getEnablePlugins: function () {
        return _webviewObj.pluginsEnabled;
    },

    notifyApplicationOrientationDone: function () {
        _webviewObj.notifyApplicationOrientationDone();
    },

    setSandbox: function (sandbox) {
        _webviewObj.setFileSystemSandbox = sandbox;
    },

    getSandbox: function () {
        return _webviewObj.setFileSystemSandbox;
    },

    downloadURL: function (url) {
        _webviewObj.downloadURL(url);
    },

    handleContextMenuResponse: function (action) {
        _webviewObj.handleContextMenuResponse(action);
    },

    allowGeolocation : function (url) {
        _webviewObj.allowGeolocation(url);
    },

    disallowGeolocation : function (url) {
        _webviewObj.disallowGeolocation(url);

    },

    addKnownSSLCertificate: function (url, certificateInfo) {
        _webviewObj.addKnownSSLCertificate(url, certificateInfo);
    },

    continueSSLHandshaking: function (streamId, SSLAction) {
        _webviewObj.continueSSLHandshaking(streamId, SSLAction);
    }

};

webview.__defineGetter__('id', function () {
    if (_webviewObj) {
        return _webviewObj.id;
    }
});

webview.__defineSetter__('onDialogRequested', function (input) {
    _webviewObj.onDialogRequested = input;
});

webview.__defineSetter__('onSSLHandshakingFailed', function (input) {
    _webviewObj.onSSLHandshakingFailed = input;
});

webview.__defineSetter__('onPropertyCurrentContextEvent', function (input) {
    _webviewObj.onPropertyCurrentContextEvent = input;
});

webview.__defineSetter__('onContextMenuRequestEvent', function (input) {
    _webviewObj.onContextMenuRequestEvent = input;
});

module.exports = webview;
