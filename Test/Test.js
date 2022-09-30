const fs = require("fs");
const path = require("path");
const Mode = require("stat-mode");

const file = path.resolve(__dirname, "tf.txt");

fs.chmod(file, 0o777, ()=>{});

fs.stat(file, (err, stats)=>{
    let mode = new Mode(stats);
    mode.owner.

    console.log(mode.toString());
})