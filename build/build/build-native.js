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
var childProcess = require("child_process"),
    utils = require("./utils"),
    fs = require("fs"),
    path = require("path"),
    _c = require("./conf");

function _exec(cmd, callback) {
    childProcess.exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.log(stdout);
            console.log(stderr);
            callback(false);
        } else {
            callback(true);
        }
    });
}

function _spawn(cmd, cwd, callback) {
    var cmd_split = cmd.split(" "),
        array = [],
        sh, i;

    for (i = 1; i <= cmd_split.length - 1; i++) {
        array.push(cmd_split[i]);
    }

    sh = childProcess.spawn(cmd_split[0], array, { 'cwd': cwd });

    sh.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    sh.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    sh.on('exit', function (code) {
        if (code !== 0) {
            callback(false, "Error " + code + " when excuting: " + cwd + " : " + cmd);
        } else {
            callback(true);
        }
    });
}

function _buildNative(ext, next, callback) {
    var cmd,
        nativeDir, simDir, deviceDir,
        configureX86, configureARM,
        stripX86, stripARM,
        
        //Command constants
        AND_CMD = " && ",
        CD_CMD = "cd ",
        MAKE_CMD = "make",
        CP_CMD = "cp ",
        SH_CMD = "sh ";
        
    //Native build directories
    nativeDir = path.join(_c.EXT, ext, "native");
    simDir = path.join(_c.EXT, ext, "simulator");
    deviceDir = path.join(_c.EXT, ext, "device");
    
    //configure-qsk commands
    configureX86 = path.join(simDir, "configure-qsk x86");
    configureARM = path.join(deviceDir, "configure-qsk arm a9");

    //strip binary commands
    stripX86 = "ntox86-strip *.so";
    stripARM = "ntoarmv7-strip *.so";
      
    //If native folder exists, Build
    if (path.existsSync(nativeDir)) {
        console.log("Building native ext: " + ext);
        
        if (!path.existsSync(simDir)) {
            fs.mkdirSync(simDir);
        }

        if (!path.existsSync(deviceDir)) {
            fs.mkdirSync(deviceDir);
        }
        
        if (utils.isWindows()) {
            cmd = CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK + " " +
                simDir + AND_CMD + CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK +
                " " + deviceDir + AND_CMD +
                CD_CMD + simDir + AND_CMD +
                SH_CMD + configureX86 + AND_CMD +
                CD_CMD + deviceDir + AND_CMD +
                SH_CMD + configureARM;
            
            // Copy and run configure-qsk
            _exec(cmd, function (success) {
                if (!success) {
                    callback(false, "Failed executing command: " + cmd);
                }
                
                // Make for Simulator
                _spawn(MAKE_CMD, simDir, function (success, err) {
                    if (!success) {
                        callback(false, err);
                    }

                    // Make for Device
                    _spawn(MAKE_CMD, deviceDir, function (success, err) {
                        if (!success) {
                            callback(false, err);
                        }
                    
                        cmd = CD_CMD + simDir + AND_CMD + stripX86 + AND_CMD +
                            CD_CMD + deviceDir + AND_CMD + stripARM;
                        
                        // Strip .so files
                        _exec(cmd, function (success) {
                            if (!success) {
                                callback(false, "Failed executing command: " + cmd);
                            }
                            
                            next();
                        });
                    });
                });
            });
        } else {
            cmd = CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK + " " +
                simDir + AND_CMD + CP_CMD + _c.DEPENDENCIES_CONFIGURE_QSK +
                " " + deviceDir + AND_CMD +
                CD_CMD + simDir + AND_CMD +
                configureX86 + AND_CMD +
                CD_CMD + deviceDir + AND_CMD +
                configureARM;
            
            // Copy and run configure-qsk
            _exec(cmd, function (success) {
                if (!success) {
                    callback(false, "Failed executing command: " + cmd);
                }

                // Make for Simulator
                _spawn(MAKE_CMD, simDir, function (success, err) {
                    if (!success) {
                        callback(false, err);
                    }

                    // Make for Device
                    _spawn(MAKE_CMD, deviceDir, function (success, err) {
                        if (!success) {
                            callback(false, err);
                        }
                    
                        cmd = CD_CMD + simDir + AND_CMD + stripX86 + AND_CMD +
                            CD_CMD + deviceDir + AND_CMD + stripARM;
                        
                        // Strip .so files
                        _exec(cmd, function (success) {
                            if (!success) {
                                callback(false, "Failed executing command: " + cmd);
                            }
                            
                            next();
                        });
                    });
                });
            });
        }
    } else {
        next();
    }
}

function _extHandler(callback) {
    var exts = fs.readdirSync(_c.EXT),
        index = -1,
        next;

    next = function () {
        index++;

        if (index === exts.length) {
            callback(true);
        }

        _buildNative(exts[index], next, callback);
    };

    next();
}

module.exports = function (prev, baton) {
    baton.take();

    _extHandler(function (success, err) {
        if (!success) {
            baton.drop(err);
        } else {
            baton.pass(prev);
        }
    });
};