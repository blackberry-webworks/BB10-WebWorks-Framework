/*
* Copyright 2012 Research In Motion Limited.
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
var wrench = require("../../node_modules/wrench"),
    fs = require("fs"),
    path = require("path"),
    _c = require("./conf"),
    CSS_FILE = "/styles/chrome.css",
    HTML_FILE = "/chrome.html",
    JS_FILE = "/index.js",
    HTML_UI = "/ui.html",
    tmpl = require("./tmpl");

module.exports = function (prev, baton) {
    var plugins,
        cssFiles = [],
        jsFiles = [],
        htmlFiles = [],
        include = function (files, transform) {
            files = files.map ? files : [files];
            return files.map(function (file) {
                var str = fs.readFileSync(file, "utf-8") + "\n";
                return transform ? transform(str, file) : str;
            }).join('\n');
        },
        outputCSS = "",
        outputJS = "",
        outputHTML = "",
        template = { locals: {} },
        cssDest = path.join(_c.DEPLOY_STYLES, 'styles.css'),
        htmlFolderDest = path.join(_c.DEPLOY, 'html'),
        cssFolderDest = path.join(htmlFolderDest, 'styles'),
        htmlDest = path.join(_c.DEPLOY_HTML, 'ui.html'),
        jsDest = path.join(_c.DEPLOY_HTML, 'index.js');

    //cleanup simulator and device folders for all native extensions
    plugins = fs.readdirSync(_c.UI_PLUGINS);
    plugins.forEach(function (plugin) {
        cssFiles.push(path.normalize(_c.UI_PLUGINS + "/" + plugin + CSS_FILE));
        jsFiles.push(path.normalize(_c.UI_PLUGINS + "/" + plugin + JS_FILE));
         
        htmlFiles[plugin] = (path.normalize(_c.UI_PLUGINS + "/" + plugin + HTML_FILE));
        //go through all the global js files that are being required by js files
        
    });     
    outputCSS = include(cssFiles);
    outputJS = include(jsFiles);
    for(plugin in htmlFiles) {
        var str = fs.readFileSync(htmlFiles[plugin], "utf-8") + "\n";
        template.locals[plugin] = str;
    }
    //complile the ui.html with the templates file
    outputHTML = tmpl.render(fs.readFileSync(_c.HTML + HTML_UI, "utf-8"),template); 
    //write all the files out to the _c.DEPLOY folder
    wrench.mkdirSyncRecursive(htmlFolderDest, "0755");
    wrench.mkdirSyncRecursive(cssFolderDest, "0755");
    
    fs.writeFileSync(cssDest, outputCSS); 
    fs.writeFileSync(jsDest, outputJS); 
    fs.writeFileSync(htmlDest, outputHTML); 
};
