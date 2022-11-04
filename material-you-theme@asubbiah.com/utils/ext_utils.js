const { Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const EXTENSIONDIR = Me.dir.get_path();

function check_bin(path) {
    const file = Gio.File.new_for_path(path);
    return file.query_exists(null);
}