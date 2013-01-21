
//require.paths.unshift('/Users/danyilin/Works/repos/github.com/BB10-WebWorks-Framework//node_modules');
var ReportGenerator = {},
    fs = require('fs'),
    jsdom = require('jsdom'),
    page_template = fs.readFileSync('test/test-reporter/test-report_templ.html', 'utf-8'),
    brief_template = fs.readFileSync('test/test-reporter/brief-report_templ.html', 'utf-8'),
    reportDocument = jsdom.jsdom(page_template),
    briefDocument = jsdom.jsdom(brief_template);

function createNewRowForSuite(suite) {
    var reportTable = reportDocument.getElementById('TestReport'),
        suiteRow = reportDocument.createElement('tr'),
        suiteDesc = reportDocument.createElement('th'),
        passedAssertionsInSuite = reportDocument.createElement('td'),
        failedAssertionsInSuite = reportDocument.createElement('td'),
        totalAssertionsInSuite = reportDocument.createElement('td'),
        resultOfSuite = reportDocument.createElement('td'),
        specRow,
        specHeader,
        specDesc,
        passedInSpec,
        failedInSpec,
        totalInSpec,
        resultOfSpec,
        i;

    suiteRow.className = "suite collapsed";
    suiteDesc.setAttribute("colspan", "2");
    suiteDesc.setAttribute("onclick", "expandSpecs(this)");
    suiteDesc.setAttribute('value', suite.description);

    if (suite.specs.length === 0) {
        suiteDesc.innerHTML = "[" + suite.description + "]";    
    } else {
        suiteDesc.innerHTML = suite.description + " +"; 
    }
    
    if (suite.passed) {
        resultOfSuite.innerHTML = "OK";
        suiteRow.className = "suite collapsed";
    } else {
        resultOfSuite.innerHTML = "NG";
        suiteRow.className = "suite collapsed suite-fail";
    }
    passedAssertionsInSuite.innerHTML = suite.assertionCount.passed;
    failedAssertionsInSuite.innerHTML = suite.assertionCount.failed;
    totalAssertionsInSuite.innerHTML = suite.assertionCount.total;
    suiteRow.appendChild(suiteDesc);
    suiteRow.appendChild(passedAssertionsInSuite);
    suiteRow.appendChild(failedAssertionsInSuite);
    suiteRow.appendChild(totalAssertionsInSuite);
    suiteRow.appendChild(resultOfSuite);
    reportTable.appendChild(suiteRow);

    for (i = 0; i < suite.specs.length; ++i) {
        passedInSpec = reportDocument.createElement('td');
        failedInSpec = reportDocument.createElement('td');
        totalInSpec = reportDocument.createElement('td');
        resultOfSpec = reportDocument.createElement('td');

        passedInSpec.className = "spec-assertion-count";
        failedInSpec.className = "spec-assertion-count";
        totalInSpec.className = "spec-assertion-count";
        resultOfSpec.className = "spec-assertion-count";
        specRow = reportDocument.createElement('tr');
        specRow.className = "specs specs-app specs-hide";
        specRow.setAttribute("name", suite.description + ".specs");
        if (i === 0) {
            specHeader = reportDocument.createElement('th');
            specHeader.className = "SpecsHeader";
            specHeader.setAttribute("rowspan", suite.specs.length);
            specHeader.innerHTML = "Specs";
            specRow.appendChild(specHeader);
        }
        specDesc = reportDocument.createElement('th');
        specDesc.innerHTML = suite.specs[i].description;
        passedInSpec.innerHTML = suite.specs[i].assertions.passed;
        failedInSpec.innerHTML = suite.specs[i].assertions.failed;
        totalInSpec.innerHTML = suite.specs[i].assertions.total;
        if (suite.specs[i].passed) {
            resultOfSpec.innerHTML = "OK";
            specRow.className = "specs specs-app specs-hide";
        } else {
            specRow.className = "specs specs-app specs-hide specs-fail";
            resultOfSpec.innerHTML = "NG";
        }
        specRow.appendChild(specDesc);
        specRow.appendChild(passedInSpec);
        specRow.appendChild(failedInSpec);
        specRow.appendChild(totalInSpec);
        specRow.appendChild(resultOfSpec);
        suiteRow.appendChild(specRow);
    }
    reportTable.appendChild(suiteRow);
}

function createNewRowForBrief(suite) {
    var suites = [
            'blackberry.app',
            'blackberry.connection',
            'blackberry.event',
            'blackberry.identity',
            'invokeRequestEvent',
            'blackberry.invoke',
            'blackberry.invoke.card',
            'blackberry.invoked',
            'blackberry.io.filetransfer',
            'blackberry.io',
            'blackberry',
            'blackberry.pim.contacts',
            'blackberry.pim.calendar',
            'blackberry.push',
            'blackberry.system',
            'blackberry.ui.contextmenu',
            'blackberry.ui.dialog',
            'blackberry.ui.toast',
            'blackberry.bbm.platform',
            'crossOrigin',
            'remoteFunctionCall',
            'blackberry.notification',
            'blackberry.sensors',
            'blackberry.ui.cover',
            'navigator.geolocation'
        ],
        briefReport = briefDocument.getElementById('BriefReport'),
        resultRow,
        suiteCol,
        resultCol,
        i;

    for (i = 0; i < suites.length; ++i) {
        if (suite.description === suites[i]) {
            resultRow = briefDocument.createElement('tr');
            suiteCol = briefDocument.createElement('td');
            resultCol = briefDocument.createElement('td');
            suiteCol.innerHTML = suites[i];
            if (suite.assertionCount.total === 0) {
                resultCol.innerHTML = 'N/A';
            } else {
                if (suite.passed) {
                    resultCol.innerHTML = 'Passed';
                } else {
                    resultCol.innerHTML = 'Failed';
                }
                resultRow.appendChild(suiteCol);
                resultRow.appendChild(resultCol);
                briefReport.appendChild(resultRow);
            }
            if (suite.passed) {
                resultCol.innerHTML = 'Passed';
            } else {
                resultCol.innerHTML = 'Failed';
            }
            resultRow.appendChild(suiteCol);
            resultRow.appendChild(resultCol);
            briefReport.appendChild(resultRow);
        }
    }

}

function generateBriefReport(testResult) {
    var i;

    for (i = 0; i < testResult.suites.length; ++i) {
        createNewRowForBrief(testResult.suites[i]);
    }

    fs.writeFileSync('test/test-reporter/testBrief.html', briefDocument.documentElement.innerHTML, "utf8");

}

function generateReport(testResult) {
    var i,
        summary,
        testSummary = reportDocument.getElementById('TestSummary');

    summary = "<pre>" +
              "Date        : " + testResult.date + "<br>" +
              "OS          : " + testResult.OS + "<br>" + 
              "Hardware ID : " + testResult.HardwareID + "<br>" +
              "Suites      : " + "passed[" + testResult.suiteCount.passed + "], failed[" + testResult.suiteCount.failed + "], total[" + testResult.suiteCount.total + "]<br>" +
              "Specs       : " + "passed[" + testResult.specCount.passed + "], failed[" + testResult.specCount.failed + "], total[" + testResult.specCount.total + "]<br>" +
              "Assertions  : " + "passed[" + testResult.assertionCount.passed + "], failed[" + testResult.assertionCount.failed + "], total[" + testResult.assertionCount.total + "]<br>" +
              "<//pre>";
    testSummary.innerHTML = summary;
    
    for (i = 0; i < testResult.suites.length; ++i) {
        createNewRowForSuite(testResult.suites[i]);
    }

    fs.writeFileSync('test/test-reporter/testReport.html', reportDocument.documentElement.innerHTML, "utf8");

}

ReportGenerator.generateReport = generateReport;
ReportGenerator.generateBriefReport = generateBriefReport;

module.exports = ReportGenerator;
