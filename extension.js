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

let g_settings;
let indicator;

function MailIndicator() {
    this._init.apply(this, arguments);
}

MailIndicator.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function()
    {
        // init iconName, /usr/share/icons/gnome/scalable/status
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'mail-unread-symbolic');

        this._menuItemHead = new PopupMenu.PopupMenuItem(_("checking new mail"), {
            reactive: false
        });
        this.menu.addMenuItem(this._menuItemHead);

        // add seperator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this.prefsMenuItem = new PopupMenu.PopupMenuItem(_("Extension Settings"));
        this.menu.addMenuItem(this.prefsMenuItem);
        this.prefsMenuItem.connect("activate", Lang.bind(this, this._launchPrefs));

        this._displayPath = g_settings.get_boolean('display-path');

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

    _launchMutt: function(menuItem)
    {
        let _path_dir_open;
        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('mutt.desktop');

        // The item looks like "(n) in libin [/work/main/libin/INBOX/]"
        let _labelName = menuItem.label.get_text().split(' ');
        if (_labelName.length < 3 ) {
            log('something wrong in menu');
            return;
        }

        // from the path name to find the path
        for (let i = 0; i < this._paths.length; i=i+2)
        {
            if (this._paths[i+1] == _labelName[2])
                _path_dir_open = this._paths[i];
        }

        // TODO: Why it can't work for '-f /work/mail/bili/research-devel/'?
        _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
                        ['-f' + _path_dir_open], -1, null);
    },

    _checkMailDirValid: function()
    {
        // TODO: we should check the valid of the mail path, 
        //       should include the cur, new, tmp
    },

    _onMailDirChanged: function(m, f, of, type)
    {
        if (type == Gio.FileMonitorEvent.CREATED || type == Gio.FileMonitorEvent.DELETED) {
            this._updateUI();
        }
    },

    _checkNewMail: function()
    {
        // get the mail paths from gsetting in format "path, name, path, name, ..."
        this._paths = g_settings.get_strv('mail-paths');
        this._paths_num = this._paths.length / 2;
        // every path will have a monitor
        this._monitors = new Array(this._paths_num);
        this._mailsCount = new Array(this._paths_num);
        this._menuItemLabels = new Array(this._paths_num);
        this._filePath = new Array(this._paths_num);

        for ( let i = 0; i < this._paths_num; i++)
        {
            this._filePath[i] = Gio.file_new_for_path(this._paths[2*i] + '/new/');
            this._mailsCount[i] = this._listDir(this._filePath[i]);
            this._monitors[i] = this._filePath[i].monitor_directory(Gio.FileMonitorFlags.NONE, null);
            this._monitors[i].connect('changed', Lang.bind(this, this._onMailDirChanged));
            if (this._displayPath)
                this._menuItemLabels[i] = new PopupMenu.PopupMenuItem('(' + this._mailsCount[i] + ') in ' + this._paths[2*i+1] + ' [' + this._paths[2*i] + ']');
            else
                this._menuItemLabels[i] = new PopupMenu.PopupMenuItem('(' + this._mailsCount[i] + ') in ' + this._paths[2*i+1]);
            this._menuItemLabels[i].connect("activate", Lang.bind(this, this._launchMutt));
            this.menu.addMenuItem(this._menuItemLabels[i], 1);
        }
    },

    _updateUI: function(item)
    {
        let _totalMails = 0;
        // just re-caculate all the directory again.
        for ( let i = 0; i < this._paths_num; i++)
        {
            this._mailsCount[i] = this._listDir(this._filePath[i]);
            log('_updateUI: the mailbox(' + i + ') have ' + this._mailsCount[i] + ' mails');
            if (this._displayPath)
                this._menuItemLabels[i].label.set_text('(' + this._mailsCount[i] + ') in ' + this._paths[2*i+1] + ' [' + this._paths[2*i] + ']');
            else
                this._menuItemLabels[i].label.set_text('(' + this._mailsCount[i] + ') in ' + this._paths[2*i+1]);
            _totalMails += this._mailsCount[i];
        }
        if (_totalMails == 0) {
            this.setIcon('mail-read-symbolic');
            this._menuItemHead.label.set_text(_("No new mails"));
        }
        else {
            this.setIcon('mail-unread-symbolic');
            this._menuItemHead.label.set_text(_totalMails + " " + _("new mails"));
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
