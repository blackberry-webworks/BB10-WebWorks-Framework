/*
* Copyright 2011 Research In Motion Limited.
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
var os = require("os"),
    fs = require('fs'),
    wrench = require("../../node_modules/wrench"),
    path = require('path');
   
module.exports = {
    isWindows : function () {
        return os.type().toLowerCase().indexOf("windows") >= 0;
    },
    
    copyFile: function (srcFile, destDir, baseDir) {
        var filename = path.basename(srcFile),
            fileBuffer = fs.readFileSync(srcFile),
            fileLocation;
        
        //if a base directory was provided, determine
        //folder structure from the relative path of the base folder
        if (baseDir && srcFile.indexOf(baseDir) === 0) {
            fileLocation = srcFile.replace(baseDir, destDir);
            wrench.mkdirSyncRecursive(path.dirname(fileLocation), "0755");
            fs.writeFileSync(fileLocation, fileBuffer);
        } else {
            fs.writeFileSync(path.join(destDir, filename), fileBuffer);
        }
    },
    
    listFiles: function (directory, filter) {
        var files = wrench.readdirSyncRecursive(directory),
            filteredFiles = [];
        
        files.forEach(function (file) {
            //On mac wrench.readdirSyncRecursive does not return absolute paths, so resolve one.
            file = path.resolve(directory, file);
        
            if (filter(file)) {
                filteredFiles.push(file);
            }
        });
        
        return filteredFiles;
    },
    
    
    // Convert node.js Buffer data (encoded) to String
    bufferToString : function (data) {
        var s = "";
        if (Buffer.isBuffer(data)) {
            if (data.length >= 2 && data[0] === 0xFF && data[1] === 0xFE) {
                s = data.toString("ucs2", 2);
                console.log("bufferToString: " + s);
            } else if (data.length >= 2 && data[0] === 0xFE && data[1] === 0xFF) {
                try {
                    swapBytes(data);
                    s = data.toString("ucs2", 2);
                } catch (e) {
                    console.log("ERROR in bufferToString(): " + e.message);
                }
            } else if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {
                s = data.toString("utf8", 3);
            } else {
                s = data.toString("ascii");
            }
        }

        return s;
    }
};
