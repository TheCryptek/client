// blah blah blah //

const cfg = require("../../cfg.json");
    
const socket = io.connect(cfg.server, {secure:true});

// uhh //

const cols = {
    "H":"ht",
    "w":"white",
    "W":"grey",
    "R":"red",
    "r":"lightred",
    "G":"green",
    "g":"lightgreen",
    "B":"blue",
    "b":"lightblue",
    "y":"yellow",
    "o":"orange",
    "P":"pink",
    "p":"lightpink",
    "V":"violet",
    "v":"ultraviolet"
};

// Game //

let shell;
let input;

let homeSys;
let connSys;

let cmdHistory = [];
let cmdHistS = [];
function shellAdd(text) {
    const e = document.createElement("p");

    e.innerHTML = text;

    e.innerHTML = e.innerHTML.split("\n").map(ln=>{
        ln = ln.split("");
        /*if (ln.includes(" ")) {
            ln[ln.indexOf(" ")] = "<pre> ";
            ln[ln.lastIndexOf(" ")] = " </pre>";
        }*/
        return ln.join("");
    }).join("<br/>");

    for (const code in cols) {
        let c = `%${code}*`;
        while (e.innerHTML.includes(c))
            e.innerHTML = e.innerHTML.replace(c, `<span class="${cols[code]}">`);
        c = `%${code}^`;
        while (e.innerHTML.includes(c))
            e.innerHTML = e.innerHTML.replace(c, `<sub class="${cols[code]}">`);
    }
    while (e.innerHTML.includes("%=*"))
        e.innerHTML = e.innerHTML.replace("%=*", "</span>");
    while (e.innerHTML.includes("%=^"))
        e.innerHTML = e.innerHTML.replace("%=^", "</sub>");
    
    //e.innerHTML = e.innerHTML.split("\n").map(l=>`<div>${l}</div>`).join("\n");

    shell.appendChild(e);

    shell.scrollTop = shell.scrollHeight
}

window.onload = ()=>{
    shell = document.getElementById("shell");
    input = document.getElementById("input");

    input.onkeydown = event=>{
        if (event.keyCode == 38) {
            event.preventDefault();

            const l = cmdHistory.filter(h=>h!=input.value&&!cmdHistS.includes(h));

            if (l.length) {
                input.value = l[l.length-1];
                input.selectionStart = input.value.length;
                cmdHistS.push(input.value);
            }
        } else if (event.keyCode == 40) {
            event.preventDefault();
            
            if (cmdHistS.length) {
                if (cmdHistS.length > 1) cmdHistS.pop();
                input.value = cmdHistS.pop();
                if (input.value == "undefined") input.value = "";
                input.selectionStart = input.value.length;
            } else input.value = "";
        } else if (cmdHistS.length) cmdHistS = [];
        
        if (event.keyCode == 13) {
            if (cmdHistory[cmdHistory.length-1] != input.value)
                cmdHistory.push(input.value);
            
            socket.emit("data", JSON.stringify({
                event: "command",
                cmd: input.value
            }));

            shellAdd(`${connSys?connSys==homeSys?"localhost >>":`${connSys} >>`:"localhost >>"} ${input.value}`);

            input.value = "";
        }
    }

    const token = localStorage.getItem("token");
    if (token) {
        socket.emit("data", JSON.stringify({
            event: "connect",
            token: token
        }));
    } else {
        window.location = "../auth/index.html";
    }

    

    socket.on("data", data=>{
        console.log(data);

        if (typeof data == "string") data = JSON.parse(data);
        //data = JSON.parse(data.toString().replace(/\n/g, "\\n"));

        if (data.event == "connection") {
            if (data.success) {
                shellAdd(`Logged into ${data.server} as ${data.player.name}.`);
            } else {
                if (token)
                    localStorage.removeItem("token");
                window.location = "../auth/index.html";
            }
        }

        if (data.msg)
            shellAdd(data.msg);
        if (data.error) {
            if (data.error == "Unauthorized")
                window.location = "../auth/index.html";
            shellAdd(data.error);
        }
        if (data.html) // deprecated
            shellAdd(data.html);
        
        if (data.player) {
            homeSys = data.player.ip;
            connSys = data.player.conn;
        }
    });
}