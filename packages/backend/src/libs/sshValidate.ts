import fs from "fs";
import crypto from "crypto"

export default function sshValidate(id: string, data: string, signature: string, url: boolean = false): boolean {
    // check that the id wontains only number
    if (id.length == 0 || id.length > 20)
        return false

    for (let letter of id)
        if ((letter < '0' || letter > '9') && (letter < 'a' || letter > 'z'))
            return false

    if (url) {
        // convert signature (base64url -> base64)
        signature = signature
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Pad out with standard base64 required padding characters
        const pad = signature.length % 4;
        if (pad) {
            if (pad === 1) {
                return false
            }
            signature += new Array(5 - pad).join('=');
        }
    }

    // get the public key
    if (!Bun.env.BASE_FOLDER || !Bun.env.KEYS_FOLDER)
        return false

    const publicKeyPath = Bun.env.BASE_FOLDER + Bun.env.KEYS_FOLDER + id + ".pem"
    if (!fs.existsSync(publicKeyPath))
        return false

    const publicKey = crypto.createPublicKey(fs.readFileSync(publicKeyPath))

    const verifier = crypto.createVerify("RSA-SHA256")
    verifier.update(data)
    verifier.end()

    return verifier.verify(publicKey, Buffer.from(signature, 'base64'))
}