/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = "my-indicator-extension";
const WALLPAPER_SCHEMA = "org.gnome.desktop.background";

const { GObject, St } = imports.gi;
const { Gio, GLib, Soup, GdkPixbuf, Gdk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Me = ExtensionUtils.getCurrentExtension();
const theme_utils = Me.imports.utils.theme_utils;
const color_utils = Me.imports.utils.color_utils;
const string_utils = Me.imports.utils.string_utils;
const { base_presets } = Me.imports.base_presets;
const { color_mappings } = Me.imports.color_mappings;

const EXTENSIONDIR = Me.dir.get_path();
const SETTINGSCHEMA = "org.gnome.shell.extensions.material-you-theme";
const DARKMODE = "dark-mode";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("My Shiny Indicator"));
      // face-smile-symbolic
      this.add_child(
        new St.Icon({
          icon_name: "applications-graphics-symbolic",
          style_class: "system-status-icon",
        })
      );

      let dark_switch = new PopupMenu.PopupSwitchMenuItem(
        _("Dark Mode"),
        get_dark_mode(),
        { reactive: true }
      );
      let wallpaper_switch = new PopupMenu.PopupSwitchMenuItem(
        _("Light Wallpaper"),
        get_wallpaper_state(),
        { reactive: true }
      );
      let refresh_btn = new PopupMenu.PopupMenuItem(
        _("Refresh Material Theme")
      );

      dark_switch.connect("toggled", (object, value) => {
        // We will just change the text content of the label
        if (value) {
          set_dark_mode(true);
        } else {
          set_dark_mode(false);
        }
        apply_theme(
          base_presets,
          color_mappings,
          get_dark_mode(),
          get_wallpaper_state(),
          {
            width: 64,
            height: 64,
          }
        );
      });

      wallpaper_switch.connect("toggled", (object, value) => {
        if (value) {
          set_wallpaper_state(true);
        } else {
          set_wallpaper_state(false);
        }
        apply_theme(
          base_presets,
          color_mappings,
          get_dark_mode(),
          get_wallpaper_state(),
          {
            width: 64,
            height: 64,
          }
        );
      });

      refresh_btn.connect("activate", () => {
        apply_theme(
          base_presets,
          color_mappings,
          get_dark_mode(),
          get_wallpaper_state(),
          { width: 64, height: 64 }
        );
      });
      this.menu.addMenuItem(dark_switch);
      this.menu.addMenuItem(wallpaper_switch);
      this.menu.addMenuItem(refresh_btn);
    }
  }
);

class Extension {
  constructor(uuid) {
    this._uuid = uuid;

    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this._uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
    // Undoing changes to theme when disabling extension
    delete_file(GLib.get_home_dir() + "/.config/gtk-4.0/gtk.css");
    delete_file(GLib.get_home_dir() + "/.config/gtk-3.0/gtk.css");
  }
}

function init(meta) {
  return new Extension(meta.uuid);
}

function get_dark_mode() {
  let settings = ExtensionUtils.getSettings(SETTINGSCHEMA);
  return settings.get_boolean(DARKMODE);
}

function set_dark_mode(bool) {
  let settings = ExtensionUtils.getSettings(SETTINGSCHEMA);
  settings.set_boolean(DARKMODE, bool);
}

function get_wallpaper_state() {
  let settings = ExtensionUtils.getSettings(SETTINGSCHEMA);
  return settings.get_boolean("wallpaper-state");
}

function set_wallpaper_state(bool) {
  let settings = ExtensionUtils.getSettings(SETTINGSCHEMA);
  settings.set_boolean("wallpaper-state", bool);
}

function apply_theme(
  base_presets,
  color_mappings,
  is_dark = false,
  wallpaper_state = true,
  size
) {
  // Getting Material theme from img

  let gsettings = new Gio.Settings({ schema: WALLPAPER_SCHEMA });
  console.log(wallpaper_state);
  let wall_uri = gsettings.get_string("picture-uri");
  if (!wallpaper_state) {
    wall_uri = gsettings.get_string("picture-uri-dark");
  }
  let wall_path = Gio.File.new_for_uri(wall_uri).get_path();
  let pix_buf = GdkPixbuf.Pixbuf.new_from_file_at_size(
    wall_path,
    size.width,
    size.height
  );
  let theme = theme_utils.themeFromImage(pix_buf);

  // Configuring for light or dark theme
  let scheme = theme.schemes.light.props;
  let base_preset = base_presets.light;
  let color_mapping = color_mappings.light;
  let theme_str = "Light";
  if (is_dark) {
    scheme = theme.schemes.dark.props;
    base_preset = base_presets.dark;
    color_mapping = color_mappings.dark;
    theme_str = "Dark";
  }

  // Converting argb to hex
  for (const key in scheme) {
    scheme[key] = "#" + scheme[key].toString(16).substring(2);
  }

  // Overwritting keys in base_preset with material colors
  for (const key in color_mapping) {
    if (color_mapping[key].opacity == 1) {
      base_preset.variables[key] = scheme[color_mapping[key].color];
    } else {
      let argb = string_utils.argbFromHex(scheme[color_mapping[key].color]);
      let r = color_utils.redFromArgb(argb);
      let g = color_utils.greenFromArgb(argb);
      let b = color_utils.blueFromArgb(argb);
      rgba_str =
        "rgba(" +
        r +
        ", " +
        g +
        ", " +
        b +
        ", " +
        color_mapping[key].opacity +
        ")";
      base_preset.variables[key] = rgba_str;
    }
  }

  // Generating gtk css from preset
  let css = "";
  for (const key in base_preset.variables) {
    css += "@define-color " + key + " " + base_preset.variables[key] + ";\n";
  }
  for (const prefix_key in base_preset.palette) {
    for (const key_2 in base_preset.palette[prefix_key]) {
      css +=
        "@define-color " +
        prefix_key +
        key_2 +
        " " +
        base_preset.palette[prefix_key][key_2] +
        ";\n";
    }
  }

  let config_path = GLib.get_home_dir() + "/.config";
  create_dir(config_path + "/gtk-4.0");
  create_dir(config_path + "/gtk-3.0");
  write_str(css, config_path + "/gtk-4.0/gtk.css");
  write_str(css, config_path + "/gtk-3.0/gtk.css");

  // Notifying user on theme change
  Main.notify(
    "Applied Material You " + theme_str + " Theme",
    "Some apps may require re-logging in to update"
  );
}

async function create_dir(path) {
  const file = Gio.File.new_for_path(path);
  try {
    await new Promise((resolve, reject) => {
      file.make_directory_async(
        GLib.PRIORITY_DEFAULT,
        null,
        (file_, result) => {
          try {
            resolve(file.make_directory_finish(result));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  } catch (e) {
    log(e);
  }
}

async function delete_file(path) {
  const file = Gio.File.new_for_path(path);
  try {
    await new Promise((resolve, reject) => {
      file.delete_async(GLib.PRIORITY_DEFAULT, null, (file_, result) => {
        try {
          resolve(file.delete_finish(result));
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (e) {
    log(e);
  }
}

async function write_str(str, path) {
  const file = Gio.File.new_for_path(path);
  try {
    await new Promise((resolve, reject) => {
      file.replace_contents_bytes_async(
        new GLib.Bytes(str),
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,
        null,
        (file_, result) => {
          try {
            resolve(file.replace_contents_finish(result));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  } catch (e) {
    log(e);
  }
}
