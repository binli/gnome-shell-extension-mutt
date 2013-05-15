// Get current plugin, such as the path
const Me = imports.misc.extensionUtils.getCurrentExtension();
// Import convenience in current plugin
const Convenience = Me.imports.convenience;

const Gio = imports.gi.Gio;

const Main = imports.ui.main;

// The PanelMenu provide SystemStatusButton which could manage Sytem Status indicator
const PanelMenu = imports.ui.panelMenu;
// The PopupMenu provide 
const PopupMenu = imports.ui.popupMenu;
const Shell = imports.gi.Shell;

const Lang = imports.lang;

let indicator;

function MailIndicator() {
    this._init.apply(this, arguments);
}

MailIndicator.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function()
    {
        // init iconName, /usr/shar/icons/gnome/scalable/status
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'mail-read-symbolic');

        let head_label = new PopupMenu.PopupMenuItem("New Mail", {
            reactive: false
        });
        this.menu.addMenuItem(head_label);

        // add seperator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.prefsMenuItem = new PopupMenu.PopupMenuItem("Extension Settings");
        this.menu.addMenuItem(this.prefsMenuItem);
        this.prefsMenuItem.connect("activate", Lang.bind(this, this._launchPrefs));
    },

    _launchPrefs: function()
    {
        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
        let _metadata = Me.metadata;

        if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING){
            // app is already running
            _gsmPrefs.activate();
        } else {
            _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
                             [_metadata.uuid], -1, null);
            this.menu.close();
        }
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
