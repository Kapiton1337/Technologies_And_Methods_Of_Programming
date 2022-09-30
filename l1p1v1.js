const PERMISSIONS_BAN = 0o000;
const PERMISSIONS_ALLOW = 0o777;

class Files {
    constructor(fileName, filePath) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.refreshPermissions();
    }

    refreshPermissions(){
        try{
            this.permissions = new Mode(fs.statSync(this.filePath));
        }
        catch (e) {
            console.log(this.fileName + " Not Found");
            this.permissionsFlag = -1;
            return 0;
        }
        this.permissionsFlag = (this.permissions.toString() == "-rwxrwxrwx") ? 1 : 0;
        console.log(this.permissions.toString());
    }

    get fileName(){
        return this.fileName;
    }
    get filePath(){
        return this.filePath;
    }
    get permissionsFlag() {
        this.permissions = new Mode(fs.statSync(this.filePath));
        return this.permissionsFlag = (this.permissions.toString() == "-rwxrwxrwx") ? 1 : 0;
    }
    fileName;
    filePath;
    permissions;
    permissionsFlag;
}

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline").createInterface({input: process.stdin, output: process.stdout});
const Mode = require("stat-mode");

const template = path.resolve(__dirname, "template.tbl");
const fileNamesCreator = (template) => {
    const fileNames = fs.readFileSync(template, 'utf-8').split('\n');
    fileNames.shift();
    return fileNames;
};
const filePathsCreator = (template) => {
    const filePaths = fs.readFileSync(template, 'utf-8').split('\n').map(file=>path.resolve(__dirname, file));
    filePaths.shift();
    return filePaths;
};
const fileObjCreator = (template) => {
    const fileNames = fs.readFileSync(template, 'utf-8').split('\n');
    fileNames.shift();
    const filePaths = fs.readFileSync(template, 'utf-8').split('\n').map(file=>path.resolve(__dirname, file));
    filePaths.shift();

    const fileObjs = {};
    if(fileNames.length == filePaths.length){
        for(let i = 0; i < fileNames.length; i++){
            fileObjs[i] = new Files(fileNames[i], filePaths[i]);
        }
    }
    else{
        console.log("Strings not equal")
    }
    return fileObjs;
};

const fileObjs = fileObjCreator(template);
let password_flag = 1;

const cipher = fs.readFileSync(template, 'utf-8').split('\n').shift();
const key = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');
const algorithm = "aes-256-cbc";

const decrypt = (algorithm, key, iv, encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
}

const deny_access = (fileObjs) => {
    console.log("start denyAccess")
    for (const i in fileObjs){
        if(fileObjs[i].permissionsFlag == 1){
            fs.chmod(fileObjs[i].filePath, PERMISSIONS_BAN, (error) => {if (error) console.log(error);})
            require('child_process').execSync('sudo chattr +i ' + fileObjs[i].filePath);
        }
        fileObjs[i].refreshPermissions();
        console.log("Permissions deniyed for file " + fileObjs[i].fileName + fileObjs[i].permissionsFlag);
    }
}
const allow_access = (fileObjs) => {
    console.log("start allowAccess")
    for (const i in fileObjs){
        if (fileObjs[i].permissionsFlag == 0) {
            require('child_process').execSync('sudo chattr -i ' + fileObjs[i].filePath)
            fs.chmod(fileObjs[i].filePath, PERMISSIONS_ALLOW, err => {if (err) console.log(err)})
        }
        console.log(new Mode(fs.statSync(fileObjs[i].filePath)).toString());
        fileObjs[i].refreshPermissions();
        console.log("Permissions granted for file " + fileObjs[i].fileName + fileObjs[i].permissionsFlag);
    }
};

console.log(fileObjs);
deny_access(fileObjs);
console.log(fileObjs);
allow_access(fileObjs);
console.log(fileObjs);

/*readline.question("Your password: ", user_password => { //Read password from console
    if (user_password == decrypt(algorithm, key, iv, cipher)) {
        password_flag = 1;
        allow_access(fileObjs);
    }
    fs.watch(path.resolve(__dirname), (event, filename) => {
        console.log(event);
        switch (event) {
            case "rename": {
                console.log("we at case rename");
                const fileNames = fileNamesCreator(template);
                if (fileObjs.find(fileObj => fileObj.fileName == filename)) {
                    if (password_flag) allow_access({filename});
                    else deny_access({filename});
                }
            }
            case "change": {
                console.log("we at case change");
                const fileNames = fileNamesCreator(template);
                if (fileObjs.find(fileObj => fileObj.fileName == filename))
                    if (!password_flag) deny_access({filename})
            }
        }

    })
    fs.watch(template, (event, filename) => {
       /!*if(event){
            filePaths = filePathsCreator(template);

            if(password_flag) allow_access(filePaths);
            else deny_access(filePaths);

            console.log(filePaths)
        }*!/
    })
    readline.close();
})*/
