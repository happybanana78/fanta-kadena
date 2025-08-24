import crypto from 'crypto';

export const useDecryptKey = (key) => {
    const algorithm = 'aes-256-gcm';
    const secret = process.env.ENCRYPTION_SECRET;

    const [ivHex, encryptedHex, tagHex] = key.split(':');
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secret, 'hex'),
        Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, 'hex')),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}
