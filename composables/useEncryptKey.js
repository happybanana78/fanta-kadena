import crypto from 'crypto';

export const useEncryptKey = (key) => {
    const algorithm = 'aes-256-gcm';
    const secret = process.env.ENCRYPTION_SECRET;

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(key, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + tag.toString('hex');
}
