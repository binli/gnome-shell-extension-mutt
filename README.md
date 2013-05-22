gnome-extension-mutt
=====================

Show new mail in gnome-shell when you are using [mutt].

![Screenshot with new mails][screenshot]
![Screenshot without new mails][screenshot-nomails]

Manual installation
-------------------

This is the **recommended method** for installation as you always get the latest version.
You can install this extension for your user by executing:

    cd ~/.local/share/gnome-shell/extensions
    git clone https://github.com/binli/gnome-shell-extension-mutt.git mutt-indicator@libin.charles.gmail.com
    glib-compile-schemas mutt-indicator@libin.charles.gmail.com/schemas/

or system wide by executing (this requires root permissions):

    cd /usr/share/gnome-shell/extensions/
    git clone https://github.com/binli/gnome-shell-extension-mutt.git mutt-indicator@libin.charles.gmail.com
    glib-compile-schemas mutt-indicator@libin.charles.gmail.com/schemas/

After installation you need to restart the GNOME shell:

* `ALT`+`F2` to open the command prompt
* Enter `r` to restart the GNOME shell

Then enable the extension:
Open `gnome-tweak-tool` -> `Shell Extensions` -> `Mutt Indicator` -> On

Installing dependencies
-------------
* Installing mutt.

For openSUSE with zypper:

`zypper install mutt`

Authors : [authors]

[mutt]: http://www.mutt.org/
[screenshot]: https://raw.github.com/wiki/binli/gnome-shell-extension-mutt/mutt-indicator.png
[screenshot-nomails]: https://raw.github.com/wiki/binli/gnome-shell-extension-mutt/mutt-indicator-nomails.png
