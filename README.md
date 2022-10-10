# Material You Color Theming
Applies generated libadwaita theme from wallpaper using Material You

![extension-screenshot](https://i.imgur.com/VLXfoEa_d.webp?maxwidth=2160&shape=thumb&fidelity=high)

<div align="center">
  <a href="https://extensions.gnome.org/extension/5236/material-you-color-theming/">
    <img src="https://img.shields.io/badge/Install%20from-extensions.gnome.org-4A86CF?style=for-the-badge&logo=Gnome&logoColor=white"/>
  </a>  
</div>

## Installation
Copy the extension to your extensions folder (create the folder if it does not exist).

**Build Dependencies**
 - `gettext`

Ubuntu

```
apt install gettext
```

Fedora

```
dnf install gettext
```

**Extension Installation**

```
git clone https://github.com/avanishsubbiah/material-you-theme
cd material-you-theme
make && make install
```
Log out and log back in and you should be able to enable it in your extension manager.

**NOTE:** Using the extension now will only theme your native installed libadwaita apps, follow the steps below to have the theme apply to GTK3 and flatpak apps and the shell.

### Shell Theming
To enable gnome shell theming first install nodejs and npm, then click the install sass button in extension preferences.

You also need to install the [User Themes](https://extensions.gnome.org/extension/19/user-themes) extensions to apply the theme.

If User Themes is installed through gnome extension store you will get a warning that the MaterialYou shell theme could not be applied automatically. In this case use Gnome Tweaks or User Themes to manually apply the MaterialYou shell theme.

### Pywal Theming
To enable Pywal theming pip3 must be installed, then click the install Pywal button in extension preferences and toggle Pywal theming on. 

If you are new to Pywal, check out the Pywal [wiki](https://github.com/dylanaraps/pywal/wiki). There are lots of things that Pywal integrates with such as [Vim](https://github.com/dylanaraps/wal.vim), [Neovim](https://github.com/AlphaTechnolog/pywal.nvim), [VSCode](https://github.com/dlasagno/vscode-wal-theme), [Zathura](https://github.com/GideonWolfe/Zathura-Pywal), and many more.

Out of the box, Pywal will only temporarily change the colors of your terminal. As a first step you should include something like 

```
if [[ -f "$HOME/.cache/wal/sequences" ]]; then
    (cat $HOME/.cache/wal/sequences)
fi
```
in your `~/.bashrc` or `~/.zshrc`


### Libadwaita
#### Native
Theming for native libadwaita will work by default.
#### Flatpak
Install [Flatseal](https://github.com/tchx84/Flatseal), and add `xdg-config/gtk-4.0:ro` to **Other Files** under the category **Filesystem** in the **All Applications** section.

### GTK3
#### Native
Install the [adw-gtk3](https://github.com/lassekongo83/adw-gtk3) theme and apply it.
#### Flatpak
After installing the [adw-gtk3](https://github.com/lassekongo83/adw-gtk3) add `xdg-config/gtk-3.0:ro` to **Other Files** under the category **Filesystem** in the **All Applications** section using [Flatseal](https://github.com/tchx84/Flatseal).

## Usage
Once the extension is enabled the extension will update your theme based on your current wallpaper and system dark mode preference. When you change your system dark mode preference or wallpaper the extension will automatically refresh your theme.

## Uninstall
Disabling the extension in your extension manager will undo theme changes back to default.
