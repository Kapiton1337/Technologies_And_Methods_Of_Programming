const crypto = require("crypto");

const decrypt = (algorithm, key, iv, encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    console.log("Decrypted message: " + decryptedData);
}

const algorithm = "aes-256-cbc";
const message = "verystrongpassword";


const key = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encryptedData = cipher.update(message, "utf-8", "hex");
encryptedData += cipher.final("hex");

console.log("Encrypted message: " + encryptedData);

decrypt(algorithm, key, iv, encryptedData);





