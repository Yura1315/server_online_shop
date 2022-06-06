import * as hapi from '@hapi/hapi' 
import Boom from '@hapi/boom'
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from './helpers'

const users: any[] = [
    {
        email: 'ychekhov@bk.ru',
        password: 'verfewcerf'
    }
]

export default {
    auth: (req: hapi.Request, h: hapi.ResponseToolkit) => {
        try {
            const {email, password} = req.payload as {email: string, password: string}
            //Поиск в БД пользователя
            const searchUser = users.find((user) => user.email === email);
            console.log(searchUser);
            return {
                searchUser
            }
        } catch (error) {
            console.log(error)
        }
    },
    reg: (req: hapi.Request, h: hapi.ResponseToolkit) => {
        try {
            // const userData = req.payload as {email: string, password: string};
        const {email, password, phone } = req.payload as {email: string, password: string, phone: string}
        const alreadyRegistered  = users.find((user) => user.email === email);
        if (alreadyRegistered) {
            // return h.response('already registered').code(400);
            return Boom.badRequest('Данный пользователь уже зарегистрирован');
        }
        const passwordHash = generateHash(password);
        const user = {
            email,
            password: passwordHash,
            phone,
            userId: uuidv4(),
            token: uuidv4(),
        }
        users.push(user)
        // console.log(users);
        return h.response(user.token);
        } catch (error) {
            console.log(error);
        }
    }

}