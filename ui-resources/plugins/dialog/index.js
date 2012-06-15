/*
 * Copyright (C) Research In Motion Limited 2012. All rights reserved.
 */

//TODO: We currently dont have event or tabs plugins
//var event = require('iris/event'),
//    tabs = require('chrome/tabs'),
var    self;

function hide(evt) {
    if (!x$('#dialog').hasClass('hidden')) {
        x$('#dialog').addClass('hidden');
    }
}

function show(desc) {
    var dialog = x$('#dialog'),
        panel = x$('#dialog-panel'),
        header = x$(document.createElement('div')),
        content = x$(document.createElement('div')),
        input,
        buttons = x$(document.createElement('div')),
        divider,
        button = x$(document.createElement('button')),
        button2,
        res = {};

    if (!dialog.hasClass('hidden')) {
        dialog.addClass('hidden');
    }
    panel.html('inner', '');

    header.addClass('dialog-header');
    content.addClass('dialog-content');
    buttons.addClass('dialog-buttons');
    button.addClass('dialog-button');

    switch (desc.dialogType) {
    case 'JavaScriptAlert':
        header.bottom(x$(document.createTextNode(desc.title ? desc.title : "JavaScript Alert"))); // TODO: i18n. Omit?
        content.bottom(desc.htmlmessage ? desc.htmlmessage : x$(document.createTextNode(desc.message)));
        button.bottom(x$(document.createTextNode(desc.oklabel ? desc.oklabel : "OK"))) // TODO: i18n
              .on('click', hide);

        panel.bottom(header)
             .bottom(content)
             .bottom(buttons
                .bottom(button));

        res.ok = button[0];
        break;
    case 'JavaScriptConfirm':
        header.bottom(x$(document.createTextNode(desc.title ? desc.title : "JavaScript Confirm"))); // TODO: i18n. Omit?
        content.bottom(desc.htmlmessage ? desc.htmlmessage : x$(document.createTextNode(desc.message)));
        button.bottom(x$(document.createTextNode(desc.oklabel ? desc.oklabel : "OK"))) // TODO: i18n
              .on('click', hide);
        divider = x$(document.createElement('div'))
            .addClass('dialog-button-divider');
        button2 = x$(document.createElement('button'))
            .addClass('dialog-button')
            .bottom(x$(document.createTextNode(desc.cancellabel ? desc.cancellabel : "Cancel"))) // TODO: i18n
            .on('click', hide);

        panel.bottom(header)
             .bottom(content)
             .bottom(buttons
                .bottom(button)
                .bottom(divider)
                .bottom(button2));

        res.ok = button[0];
        res.cancel = button2[0];
        res.oktext = 'true';
        break;
    case 'JavaScriptPrompt':
        header.bottom(x$(document.createTextNode(desc.title ? desc.title : "JavaScript Prompt"))); // TODO: i18n. Omit?
        input = x$(document.createElement('input'))
            .attr('type', 'text')
            .addClass('dialog-input')
            .on('keydown', function (keyEvent) { 
                if (parseInt(keyEvent.keyCode, 10) === 13) { 
                    button.click(); 
                } 
            });
        content.bottom(desc.htmlmessage ? desc.htmlmessage : x$(document.createTextNode(desc.message)));
        button.bottom(x$(document.createTextNode(desc.oklabel ? desc.oklabel : "OK"))) // TODO: i18n
              .on('click', hide);
        divider = x$(document.createElement('div'))
            .addClass('dialog-button-divider');
        button2 = x$(document.createElement('button'))
            .addClass('dialog-button')
            .bottom(x$(document.createTextNode(desc.cancellabel ? desc.cancellabel : "Cancel"))) // TODO: i18n
            .on('click', hide);

        panel.bottom(header)
             .bottom(content
                .bottom(input))
             .bottom(buttons
                .bottom(button)
                .bottom(divider)
                .bottom(button2));

        res.ok = button[0];
        res.cancel = button2[0];
        res.__defineGetter__('oktext', function () { 
            return input[0].value; 
        });
        break;
    case 'Generic':
    case 'GeolocationPermission':
    case 'DatabaseQuotaExceeded':
    case 'AuthenticationChallenge':
        /* falls through */
    default:
        return;
    }
    dialog.removeClass('hidden');
    return res;
}

function requestDialog(id, evt, evtId) {
    if (id === iris.chromeId) {
        console.error("chrome shouldn't spawn dialogs. Doing nothing.");
        return;
    }
    //TODO: Not set up in WebWorks Framework
    //tabs.update(id, {selected: true});

    var res = show(evt);
    if (res) {
        qnx.callExtensionMethod('eventLoop.delayEvent', evtId);
        if (res.ok) {
            x$(res.ok).on('click', function () {
                qnx.callExtensionMethod(
                    'eventLoop.resumeEvent',
                    evtId,
                    '{"setPreventDefault": true' + (res.hasOwnProperty('oktext') ? ', "setResult": "' + res.oktext + '"' : '') + '}'
                );
            });
        }
        if (res.cancel) {
            x$(res.cancel).on('click', function () {
                qnx.callExtensionMethod('eventLoop.resumeEvent', evtId, '{"setPreventDefault": true}');
            });
        }
    }
}

self = {
    /**
     * description can have
     *   title - the title of the dialog
     *   message - the dialog's message. Text only
     *   htmlmessage - alternate message content, can contain HTML
     *   oklabel - the label for the primary/action/OK button
     *   cancellabel - the label for the secondary/dismiss/Cancel button
     *
     * @returns object res
     *   ok - The ok button element. Attach your click handlers here
     *   cancel - The cancel button element. Attach your click handlers here
     *   oktext - The string "true" for hitting OK on a Confirm, the input's value for hitting OK on a Prompt, or absent
     */
    showDialog: function (description) {
        return show(description);
    },

    init: function () {
        /*
        * TODO: We this is not set up for WebWorks Framework
        event.on('DialogRequested', requestDialog);
        event.on('chrome.tabs.onCreated', function (tab) {
            if (tab.id != iris.chromeId) {
                qnx.callExtensionMethod('webview.setEnableDialogRequestedEvents', tab.id, true);
            }
        });
        */
    }
};

//TODO: We currently do not have event plugins
//event.on('browser.plugins.init', self.init);

module.exports = self;
