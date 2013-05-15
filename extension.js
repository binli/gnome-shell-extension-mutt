// Get current plugin, such as the path
const Me = imports.misc.extensionUtils.getCurrentExtension();
// Import convenience in current plugin
const Convenience = Me.imports.convenience;

const Gio = imports.gi.Gio;

const Main = imports.ui.main;

// The PanelMenu provide SystemStatusButton which could manage Sytem Status indicator
const PanelMenu = imports.ui.panelMenu;

let indicator;

function MailIndicator() {
    this._init.apply(this, arguments);
}

MailIndicator.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        // init iconName, /usr/shar/icons/gnome/scalable/status
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'mail-read-symbolic');
    }
}

function init() {
}

function enable() {
    indicator = new MailIndicator();
    // show indicator in status area
    Main.panel.addToStatusArea('MailIndicator', indicator);
}

function disable() {
    if (indicator !== null) indicator.destroy();
    indicator = null;
}
