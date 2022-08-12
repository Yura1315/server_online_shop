import crypto from 'crypto'

export const generateHash = (data: string) =>
    crypto
        .createHash('md5')
        .update(data)
        .digest('hex');


export const assignCart = (a: any, b: any) => {
    const cart = [...a];
    check: for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < a.length; j++) {
            if (b[i]._id != a[j]._id && j === a.length - 1) {
                cart.push(b[i]);
            } else if (b[i]._id === a[j]._id) {
                cart[j].count = cart[j].count + b[i].count
                continue check
            }
        }
    }
    return cart
}