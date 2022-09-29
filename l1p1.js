const fs = require("fs")
const path = require("path")
const readline = require("readline").createInterface({input: process.stdin, output: process.stdout})
const crypto = require("crypto")

const key = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');
const algorithm = "aes-256-cbc";

const decrypt = (algorithm, key, iv, encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
}

const template = path.resolve(__dirname, "template.tbl");
const fileNameList = fs.readFileSync(template, "utf-8").split("\n");
let permissions = 0o000;
let mode = "+i"

readline.question("Your password: ", password => {
    if(password == decrypt(algorithm, key, iv, fileNameList[0])) {
        mode = "-i";
        permissions = 0o777;
        for (let i = 1; i < fileNameList.length; i++) {
            require('child_process').execSync('sudo chattr ' + mode + ' ' + path.resolve(__dirname, fileNameList[i]))
            fs.chmod(fileNameList[i], permissions, err => {if (err) console.log(console.log(err))});
        }
    }
    else {
        for (let i = 1; i < fileNameList.length; i++) {
            fs.chmod(fileNameList[i], permissions, err => {if (err) console.log(console.log(err))});
            require('child_process').execSync('sudo chattr ' + mode + ' ' + path.resolve(__dirname, fileNameList[i]))
        }
    }
    readline.close();
})

fs.watch(path.resolve(__dirname), (event, filename)=>{
    for (let i = 1; i < fileNameList.length; i++) {
        fs.chmod(fileNameList[i], permissions, err => {if (err) console.log(console.log(err))});
        require('child_process').execSync('sudo chattr ' + mode + ' ' + path.resolve(__dirname, fileNameList[i]))
    }
})

