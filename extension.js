// Get current plugin, such as the path
const Me = imports.misc.extensionUtils.getCurrentExtension();
// Import convenience in current plugin
const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const Gio = imports.gi.Gio;

const Main = imports.ui.main;

// The PanelMenu provide SystemStatusButton which could manage Sytem Status indicator
const PanelMenu = imports.ui.panelMenu;
// The PopupMenu provide 
const PopupMenu = imports.ui.popupMenu;
const Shell = imports.gi.Shell;

const Lang = imports.lang;
// ListDirAsync provided by fileUtils
const FileUtils = imports.misc.fileUtils

let g_settings;
let g_mails = [];
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

        let head_label = new PopupMenu.PopupMenuItem(_("New Mail"), {
            reactive: false
        });
        this.menu.addMenuItem(head_label);

        // add seperator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.prefsMenuItem = new PopupMenu.PopupMenuItem(_("Extension Settings"));
        this.menu.addMenuItem(this.prefsMenuItem);
        this.prefsMenuItem.connect("activate", Lang.bind(this, this._launchPrefs));

        this._displayPath = g_settings.get_strv('display-path');

        this._checkNewMail();
        this._updateUI();
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
    },

    _checkMailDirValid: function()
    {
    },

    _checkNewMail: function()
    {
        // get the mail paths from gsetting in format "path, name, path, name, ..."
        this._paths = g_settings.get_strv('mail-paths');
        this._paths_num = this._paths.length / 2;
        // every path will have a monitor
        this._monitors = new Array(this._paths_num);
        g_mails = new Array(this._paths_num);
        this._labels = new Array(this._paths_num);

        for ( let i = 0; i < this._paths_num; i++)
        {
            let file_path = Gio.file_new_for_path(this._paths[2*i] + '/new/');
            log(file_path.get_path());
            g_mails[i] = this._listDir(file_path);
        }
    },

    _updateUI: function(item)
    {
        for ( let i = 0; i < this._paths_num; i++)
        {
            let mail_label;
            log('_updateUI: the number is ' + i + 'the mail number is' + g_mails[i]);
            if (this._displayPath)
                mail_label = new PopupMenu.PopupMenuItem('(' + g_mails[i] + ') in ' + this._paths[2*i+1]);
            else
                mail_label = new PopupMenu.PopupMenuItem('(' + g_mails[i] + ') in ' + this._paths[2*i+1] + ' [' + this._paths[2*i] + ']');
            this.menu.addMenuItem(mail_label, 1);
        }
    },

    _listDir: function(file)
    {
        let number = 0;
        let enumerator = file.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                            Gio.FileQueryInfoFlags.NONE,
                            null,
                            null);
        let single_file = enumerator.next_file(null);
        while (single_file != null) {
            //log(single_file.get_name());
            number++;
            single_file = enumerator.next_file(null);
        }
        return number;
        // should close the enumerator?
    }
}

function init() {
    Convenience.initTranslations(Me.metadata['gettext-domain']);
    g_settings = Convenience.getSettings();
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
