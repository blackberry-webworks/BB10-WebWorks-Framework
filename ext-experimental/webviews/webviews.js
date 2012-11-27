/**
* The abstraction layer for webviews functionality
 *
 * @author dkerr
 * $Id: webviews.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var networkResourceRequested = require('../../lib/webkitHandlers/networkResourceRequested'),
    _readyTrigger,
    _destroyedTrigger,
    _webviews = {};

function screenWindowHandle(id) {
    return qnx.callExtensionMethod("webview.jsScreenWindowHandle", id);
}

function onWebviewCreated() {
}

function onAnimationFinished(animationId) {
    console.log(animationId);
}

module.exports = {

    /*
     * Creates the webview through the webplatform.js module provided in the webworks framework
     * @param args {Object} Webview parameters
     * Ex: {
     *      url: [optional],
     *      x: <left>,
     *      y: <top>,
     *      w: <width>,
     *      h: <height>,
     *      z: <zOrder>
     *  }
     * @returns id {Number} The webviews ID
     */
    create: function (args) {
        console.log("Creating Webview with the given args ", args);
        var webviewObj = window.qnx.webplatform.createWebView(function () {
            var requestObj =  networkResourceRequested.createHandler(webviewObj);

            webviewObj.visible = true;
            webviewObj.active = true;
            webviewObj.zOrder = args.z;
            webviewObj.setGeometry(args.x, args.y, args.w, args.h);
            webviewObj.webviewHandle = screenWindowHandle(webviewObj.id);
            webviewObj.autoDeferNetworkingAndJavaScript = false;
            webviewObj.executeJavaScript("1 + 1");

            webviewObj.onNetworkResourceRequested = requestObj.networkResourceRequestedHandler;

            if (args.url) {
                webviewObj.url = args.url;
            }

            // dispatch the webviewready event
            if (_readyTrigger && typeof _readyTrigger === 'function') {
                onWebviewCreated(webviewObj.id);
                _readyTrigger({id: webviewObj.id, webviewHandle: webviewObj.webviewHandle});
            }
        });

        webviewObj.params = args;
        _webviews[webviewObj.id] = webviewObj;

        return webviewObj.id;
    },

    /**
     * Destroys the webview
     * @param id {Number} The webview ID
     */
    destroy: function (id) {
        _webviews[id].destroy(function () {
            if (_destroyedTrigger && typeof _destroyedTrigger === 'function') {
                _destroyedTrigger({id: id});
            }
            delete _webviews[id];
        });
        return true;
    },

    /**
     * Sets the trigger function to call when a volume event is fired
     * @param trigger {Function} The trigger function to call when the event is fired
     */
    setReadyTrigger: function (trigger) {
        _readyTrigger = trigger;
    },

    /**
     * Sets the trigger function to call when a volume event is fired
     * @param trigger {Function} The trigger function to call when the event is fired
     */
    setDestroyedTrigger: function (trigger) {
        _destroyedTrigger = trigger;
    },

    /**
     * Gets the webview object
     * @param id {Number} The webview ID
     * @returns webview {Object} The webview object
     */
    getWebview: function (id) {
        return _webviews[id];
    }

};
