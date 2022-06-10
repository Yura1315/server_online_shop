import * as hapi from '@hapi/hapi'
import joi from 'joi';
import controlers from './controlers';


const routes: hapi.ServerRoute[] = [
    {
        method: 'GET',
        path: '/',
        handler: (req: hapi.Request) => {
            return 'product';
        }
    },
    {
        method: 'POST',
        path: '/logged/reg',
        handler: controlers.reg,
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    email: joi.string().email().required(),
                    phone: joi.string().required(),
                    password: joi.string().required(),
                })
            }
        }
    },
    {
        method: 'POST',
        path: '/logged/auth',
        handler: controlers.auth,
        options: {
            validate: {
                payload: joi.object({
                    email: joi.string().required(),
                    password: joi.string().required()
                }),
            },
        }
    },
    {
        method: 'GET',
        path: '/admin',
        handler: (req: hapi.Request, h: hapi.ResponseToolkit) => {
            return {
                name: 'vasya',
                surname: 'pupkin',
                isAdmin: true,
            }
        },
        options: {
            auth: {
                strategy: 'admin',
                // scope: ['admin']
            }
        }
    },
    {
        method: 'GET',
        path: '/auth-two',
        handler: controlers.auth2,
        options: {
            auth: {
                strategy: 'user'
            }
        }
    }
]

export default routes;