/**
 * Allows limited creation and control of webview objects
 *
 * @author dkerr
 * $Id: client.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */

var _ID = require("./manifest.json").namespace;


var Tab = (function () {
    var Tab =  function () {};
    Tab.prototype.resize = function () {};
    Tab.prototype.setZOrder = function () {};
    return Tab;
}());



/**
 * Exports are the publicly accessible functions
 */
module.exports = {

    /**
     * Initializes the extension and the application's webview.
     * @param args {Object} The dimensions of the webview
     * Ex: {
     *      x: <left>,
     *      y: <top>,
     *      w: <width>,
     *      h: <height>,
     *  }
     */
    init: function (args) {
        window.webworks.execSync(_ID, "init", args);
    },

    /**
     * Creates a new webview
     * @param args {Object} The list of params needed to create a webview
     * Ex: {
     *      url: [optional],
     *      x: <left>,
     *      y: <top>,
     *      w: <width>,
     *      h: <height>,
     *      z: <zOrder>
     *  }
     * @returns {Number} The webview ID
     */
    create: function (options) {
        var args = {};

        if (options) {
            args.options = options;
        }

        window.webworks.execSync(_ID, "create", args);

        return new Tab();
    },

    /**
     * Destroys a webview
     * @param id {Number} The webview ID
     */
    destroy: function (id) {
        window.webworks.execSync(_ID, "destroy", {
            id: id
        });
    }
};
