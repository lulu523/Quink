/**
 * Copyright (c), 2013-2014 IMD - International Institute for Management Development, Switzerland.
 *
 * See the file license.txt for copying permission.
 */

/*global QUINK */
define([
    'jquery',
    'rangy',
    'command/Command',
    'ext/PluginMgr',
    'hithandler/HitHandler',
    'keyhandler/KeyHandlerMgr',
    'service/Persist',
    'ui/Caret',
    'ui/CommandStateBar',
    'ui/Toolbar',
    'util/Env',
    'util/FocusTracker',
    'util/PubSub'
], function ($, rangy, Command, PluginMgr, HitHandler, KeyHandlerMgr, Persist, Caret, CommandStateBar, Toolbar, Env, FocusTracker, PubSub) {
    'use strict';

    function init() {
        var selector = '[contenteditable=true]',
            tbDownloads, csbDownloads, pmDownloads, khmDownloads;
        Persist.initFromAutoSave();
        rangy.init();
        Env.init();
        khmDownloads = KeyHandlerMgr.init(selector);
        FocusTracker.init(selector);
        Command.init();
        csbDownloads = CommandStateBar.create();
        HitHandler.init(selector);
        tbDownloads = Toolbar.init();
        pmDownloads = PluginMgr.init();
        Caret.init();
        Persist.init();
        $.when(tbDownloads, csbDownloads, pmDownloads, khmDownloads).done(function () {
            if (typeof QUINK.ready === 'function') {
                QUINK.ready(PubSub);
            }
        }).fail(function () {
            console.log('downloads failed...');
        });
    }

    return {
        init: init
    };
});
