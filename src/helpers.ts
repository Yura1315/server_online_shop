import crypto from 'crypto'

export const generateHash = (data: string) => 
crypto
    .createHash('md5')
    .update(data)
    .digest('hex');