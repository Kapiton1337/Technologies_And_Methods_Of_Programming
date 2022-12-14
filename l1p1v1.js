const PERMISSIONS_BAN = 0o000;
const PERMISSIONS_ALLOW = 0o777;

class files {
    constructor(filePath) {
        this.filePath = filePath;
        this.permissions = 0;
    }
    access_permissions = () => {
        this.permissions = 1;
    }
    deny_permissions = () => {
        this.permissions = 0;
    }
    get permissions() {
        return this.permissions;
    }
    get filePath(){
        return this.filePath;
    }

    permissions;
    filePath;
}

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline").createInterface({input: process.stdin, output: process.stdout})

const template = path.resolve(__dirname, "template.tbl");
const fileData = fs.readFileSync(template, 'utf-8').split('\n');

let password_flag = 0;
const cipher = fileData.shift();
const filePaths = fs.readFileSync(template, 'utf-8').split('\n').map(file=>path.resolve(__dirname, file));

const key = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');
const algorithm = "aes-256-cbc";

const decrypt = (algorithm, key, iv, encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
}
const deny_access = (filePaths) => {
    for (const i in filePaths){
        fs.chmod(filePaths[i], PERMISSIONS_BAN, (error) => {
            if (error) {
                if(error.errno == -2) console.log(filePaths[i] + " - No such file");
            }
            else {
                require('child_process').execSync('sudo chattr +i ' + filePaths[i])
            }
        })
    }
}
const allow_access = (filePaths) => {
    for (const i in filePaths){
        if (fs.existsSync(filePaths[i])) {
            require('child_process').execSync('sudo chattr -i ' + filePaths[i])
            fs.chmod(filePaths[i], PERMISSIONS_ALLOW, err => {if (err) console.log("Ok")})
        }
    }
};

deny_access(filePaths); //Deny access for all files

readline.question("Your password: ", user_password => { //Read password from console
    if (user_password == decrypt(algorithm, key, iv, cipher)) {
        password_flag = 1;
        allow_access(filePaths);
    }
    fs.watch(path.resolve(__dirname), (event, filename) => {
        console.log(event);
        switch (event) {
            case "rename": {
                console.log("we at case rename");
                if (fileNames.indexOf(filename) != -1) {
                    if (password_flag) allow_access({filename});
                    else deny_access({filename});
                }
            }
            case "change": {
                console.log("we at case change");
                if (fileNames.indexOf(filename) != -1)
                    if (!password_flag) deny_access({filename})
            }
        }

    })
    fs.watch(template, (event, filename) => {
        /*if(event){
            filePaths = filePathsCreator(template);

            if(password_flag) allow_access(filePaths);
            else deny_access(filePaths);

            console.log(filePaths)
        }
    })*/
        readline.close();
    })
})
