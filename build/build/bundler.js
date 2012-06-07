var fs = require('fs'),
    path = require('path');

module.exports = {
    bundle: function () {
        var fs = require('fs'),
            crypto = require('crypto'),
            shasum = crypto.createHash('md5'),
            files = [
                "lib/public/builder.js",
                "lib/public/window.js",
                "lib/public/event.js",
                "lib/utils.js",
                "lib/exception.js"
            ],
            include = function (files, transform) {
                files = files.map ? files : [files];
                return files.map(function (file) {
                    var str = fs.readFileSync(file, "utf-8") + "\n";
                    return transform ? transform(str, file) : str;
                }).join('\n');
            },
            output = "",
            version = fs.readFileSync("version", "utf-8").trim(),
            filepath,
            hash,
            
            //output sections
            license,
            open_closure,
            content,
            hash_injection,
            end_closure;

        //include LICENSE
        license = include("LICENSE", function (file) {
            return "/*\n" + file + "\n*/\n";
        });

        //Open closure
        open_closure = "(function () { \n";
        
        //include require
        content = include("dependencies/require/require.js");

        //include modules
        content += include(files, function (file, path) {
            return "define('" + path.replace(/lib\/public\//, "").replace(/\.js$/, "") +
                   "', function (require, exports, module) {\n" + file + "});\n";
        });

        //include window.webworks
        content += include("lib/public/window-webworks.js");

        //Close closure
        end_closure = "\n}());";
        
        //Hash the sections
        shasum.update(license + open_closure + content + end_closure);
        hash = shasum.digest('hex');
        
        hash_injection = "this.webworksHash = '" + hash + "';\n";
        
        //output
        output = license + open_closure + hash_injection + content + end_closure;
        
        //Create webworks-version file to be placed in bar and compared against at runtime.
        //This is neccessary to determine if the apps webworks.js is compatible with the framework.
        fs.writeFileSync(__dirname.replace(/\\/g, '/') + "/../../webworks-version", hash);
        
        //create output folder if it doesn't exist
        filepath = __dirname.replace(/\\/g, '/') + "/../../clientFiles";
        if (!path.existsSync(filepath)) {
            fs.mkdirSync(filepath, "0777"); //full permissions
        }
        
        //Create webworks.js file
        fs.writeFileSync(filepath + "/webworks-" + version + ".js", output);
    }
};
