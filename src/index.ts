import * as hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import * as AuthBearer from 'hapi-auth-bearer-token';
import * as path from 'path';
import routes from './routes';

dotenv.config({
    path: path.join(__dirname, '../.env')
})

const srv = hapi.server({
    port: 5000,
    routes: {
        validate: {
            failAction: (req, h, err) => {
                throw err;
            }
        }
    }
})


const plugins: any[] = [
    AuthBearer
]

srv.register(plugins).then(() => {
    srv.route(routes);

    
    srv.start().then(()=> {
        console.log('started');
        console.log(process.env.ADMIN_TOKEN)
    })
})

srv.auth.strategy('admin', 'bearer-access-token', {
    validate: (req: hapi.Request, token, h: hapi.ResponseToolkit) => {
        console.log('in validate', token)
        const isValid = process.env.ADMIN_TOKEN == token
        return {
            isValid,
            credentials: {},
            artifacts: {}
        }
    }
});