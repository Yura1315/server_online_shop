import * as hapi from '@hapi/hapi'
import Boom from '@hapi/boom'
import database from './database/connection';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from './helpers'


export default {
    auth: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
        try {
            const { email, password } = req.payload as { email: string, password: string }
            //Поиск в БД пользователя
            const foundUser = await database.user.findOne({ email })
            if (!foundUser) {
                return Boom.badRequest('Не удалось найти пользователя');
            } else if (foundUser.password !== generateHash(password)) {
                return Boom.badRequest('Не верная почта пользователя или пароль');
            }
            return h.response(foundUser);
        } catch (error) {
            return Boom.badImplementation('Произошла ошибка при авторизации, попробуйте позднее')
        }
    },
    auth2: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
        try {
            const fUser = req.auth.credentials;
            console.log(fUser)
            return h.response(fUser);
        } catch (e) {
            console.log(e);
        }
    },
    reg: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
        try {
            const { email, password, phone, name } = req.payload as { email: string, password: string, phone: string, name: string }
            const alreadyRegistered = await database.user.findOne({ email })
            if (alreadyRegistered) {
                const err = Boom.badRequest('Данный пользователь уже зарегистрирован');
                return h.response(err.output)
            } else {
                const user = {
                    name,
                    email,
                    password: generateHash(password),
                    phone,
                    userId: uuidv4(),
                    token: uuidv4(),
                }
                await database.user.create(user)
                const res = { name: user.name, token: user.token, email: user.email, phone: user.phone, userId: user.userId }
                return h.response(res);
            }
        } catch (e) {
            return Boom.badImplementation('Произошла ошибка при регистрации, попробуйте позже')
        }
    }

}