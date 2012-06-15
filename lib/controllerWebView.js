var controllerWebView;

controllerWebView = {
    init: function (config) {
        var controller = window.qnx.webplatform.getController();
        controller.enableWebInspector = config.debugEnabled;
        controller.enableCrossSiteXHR = true;
        controller.visible = true;
        controller.active = false;
        controller.setGeometry(0, 0, screen.width, screen.height);
    }
};

module.exports = controllerWebView;
