/**
 * The event context for webview events
 *
 * @author dkerr
 * $Id: context.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
*/

var _webviews = require("./webviews");

module.exports = {

    /**
     * Method called when the first listener is added for an event
     * @param event {String} The event name
     * @param trigger {Function} The trigger function to call when the event is fired
     */
    addEventListener: function (event, trigger) {
        if (event && trigger) {
            switch (event) {
            case "webviewready":
                _webviews.setReadyTrigger(trigger);
                break;
            case "webviewdestroyed":
                _webviews.setDestroyedTrigger(trigger);
                break;
            }
        }
    },

    /**
     * Method called when the last listener is removed for an event
     * @param event {String} The event name
     */
    removeEventListener: function (event) {
        if (event) {
            switch (event) {
            case "webviewready":
                _webviews.setReadyTrigger(null);
                break;
            case "webviewdestroyed":
                _webviews.setDestroyedTrigger(null);
                break;
            }
        }
    }
};
