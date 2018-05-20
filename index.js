const cfg = require("./cfg.json");

const url = require("url");
const path = require("path");
const electron = require("electron");

const app = electron.app
const Window = electron.BrowserWindow;

let window;

function init() {
    // App //

    console.log("App ready - initialising.");

    window = new Window({
        width:1280,
        height:800
    });

    window.setMenu(null);

    window.loadURL(url.format({
        pathname: path.join(__dirname, "html/index.html"),
        protocol: "file:",
        slashes: true
    }));

    // debug //

    //window.toggleDevTools();
}

app.on("ready", init);