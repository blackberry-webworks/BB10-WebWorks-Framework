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

var port = process.argv[2] || 3000,
    timeout = process.argv[3] || 60 * 60 * 1000, // set timeout to 20 minutes
    util = require("util"),
    http = require('http'), 
    url = require('url'),
    path = require("path"),
    qs = require('querystring'),
    fs = require('fs'),
    wrench = require('wrench'),
    utils = require('../../build/build/utils'),
    reportGenerator = require('./ReportGenerator'),
    testReportDir = process.argv[4] || './target/TestReport/',
    jasmineDir = './dependencies/jasmine/lib/jasmine-core',
    detailsPath = testReportDir + 'details/TestDetails.html',
    detailsJSDir = './test/test-app/js',
    detailsCSSDir = './test/test-app/css',
    reportInJSONPath = testReportDir + 'Report.json',
    reportInXMLPath = testReportDir + 'Report.xml',
    reportInHTMLPath = testReportDir + 'Report.html';

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri),
        data = "",
        report = {};

    console.log('filename: ', filename);
    if (uri === '/runAutoTest') {
        console.log("start auto test");
        response.end('Successful', 'utf-8');
    }

    if (request.method === 'POST' && uri === '/report') {
        request.on("data", function (chunk) {
            data += chunk;
        }); 

        request.on("end", function () {
            // Create report folder
            if (!fs.existsSync(testReportDir + 'details')) {
                wrench.mkdirSyncRecursive(testReportDir + 'details', "0755");
                // Copy jasmin js and css to testReport folder
                wrench.copyDirSyncRecursive(detailsJSDir, testReportDir + 'js');
                wrench.copyDirSyncRecursive(detailsCSSDir, testReportDir + 'css');

                utils.copyFile(path.join(jasmineDir, "jasmine.js"), testReportDir + 'js', undefined, true);
                utils.copyFile(path.join(jasmineDir, "jasmine-html.js"), testReportDir + 'js', undefined, true);
                utils.copyFile(path.join(jasmineDir, "jasmine.css"), testReportDir + 'css', undefined, true);
            }
            report = JSON.parse(data);
            fs.writeFileSync(detailsPath, report.details, "utf8");
            delete report.details;
            console.log("Testing Result: \n", JSON.stringify(report));
            reportGenerator.generateReport(report);
            reportGenerator.generateBriefReport(report);
            fs.writeFileSync(reportInJSONPath, JSON.stringify(report), "utf8");
            response.end();
            if (report.failed !== 0) {
                process.exit(1);
            } else {
                console.log('Shutting down report server');
                process.exit(0);
            }
        });
    }
}).listen(port);
 
console.log('Testing report server running at http://127.0.0.1:' + port + '/');
console.log('Waiting for testing result...');

// wait 60*60 seconds
setTimeout(function () {
    console.log("Time Out: No any testing report returned, stop waiting...");
    process.exit(1);
}, timeout);
