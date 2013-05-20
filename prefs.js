const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const EXTENSIONDIR = Me.dir.get_path();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

let g_settings;

const MuttIndicatorPrefsWidget = new GObject.Class(
{
    Name: 'MuttIndicatorExtension.Prefs.Widget',
    GTypeName: 'MuttIndicatorExtensionPrefsWidget',
    Extends: Gtk.Box,

    _init: function(params)
    {
        this.parent(params);

        this.initWindow();

        this.add(this.MainBox);
    },

    Window : new Gtk.Builder(),

    initWindow: function ()
    {
        let that = this;
        this.Window.add_from_file(EXTENSIONDIR+"/mutt-indicator.ui");

        this.MainBox = this.Window.get_object("main_box");
        this.LabelPath = this.Window.get_object("label_path");
        this.LabelPath.set_label(_("Please add/remove the Mail Directory which need be monitored:"));

        this.ModelListstore = new Gtk.ListStore();
        this.ModelListstore.set_column_types([
                        GObject.TYPE_STRING,
                        GObject.TYPE_STRING
                        ]);

        this._paths = g_settings.get_strv('mail-paths');
        log(this._paths.length);
        let iter = this.ModelListstore.get_iter_first();

        for (let i = 0; i < this._paths.length; i=i+2)
        {
            log(this._paths[i]);
            iter = this.ModelListstore.append();
            this.ModelListstore.set(iter, [0, 1], [this._paths[i], this._paths[i+1] ]);
        }

        this.treeview = this.Window.get_object("path_treeview");
        this.treeview.set_model(this.ModelListstore);

        let cell_render_1st = new Gtk.CellRendererText();
        let column_1st = new Gtk.TreeViewColumn({
            'title': 'path',
            'expand': true
        });

        column_1st.pack_start(cell_render_1st,true);
        column_1st.add_attribute(cell_render_1st, 'text', 0);
        this.treeview.append_column(column_1st);

        let cell_render_2nd = new Gtk.CellRendererText();
        let column_2nd = new Gtk.TreeViewColumn({
            'title': 'name',
            'expand': true
        });
        column_2nd.pack_end(cell_render_2nd,true);
        column_2nd.add_attribute(cell_render_2nd, 'text', 1);
        this.treeview.append_column(column_2nd);

        this.Window.get_object("tree-toolbutton-add").connect("clicked",function()
        {
            that.addPath();
        });

        this.Window.get_object("tree-toolbutton-del").connect("clicked",function()
        {
            that.delPath();
        });

        this.Window.get_object("treeview-selection").connect("changed",function(selection)
        {
            // get which line is selected, it will return 0 for first, 1 for second, ..
            let a = selection.get_selected_rows(this.ModelListstore)[0][0];
            if(typeof a != "undefined")
                this.current_select = parseInt(a.to_string());
        });
    },

    addPath : function()
    {
    },

    delPath : function()
    {
    }
});

function init() {
    Convenience.initTranslations(Me.metadata['gettext-domain']);
    g_settings = Convenience.getSettings();
}

function buildPrefsWidget() {
    // NOTE: why call the buildPrefsWidget twice??
    log("buildPrefsWidget");
    let widget = new MuttIndicatorPrefsWidget();

    widget.show_all();

    return widget;
}
