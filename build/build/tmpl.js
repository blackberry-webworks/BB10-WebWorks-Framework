var mustache = require("mustache");

var tmpl = {
    compile: function (source, options) {
        if (typeof source === 'string') {
            return function (options) {
                options.locals = options.locals || {};
                options.partials = options.partials || {};
                return mustache.to_html(
                    source, options.locals, options.partials);
            };
        } else {
            return source;
        }
    },
    render: function (template, options) {
        template = this.compile(template, options);
        return template(options);
    }
};

module.exports = tmpl;
