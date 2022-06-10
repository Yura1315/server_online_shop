import * as hapi from '@hapi/hapi';
import * as path from 'path';
import dotenv from 'dotenv';
import * as AuthBearer from 'hapi-auth-bearer-token';
import makeAdminAuth from './auth/adminAuth';
import makeUserAuth from './auth/userAuth';
import routes from './routes';
import inert from '@hapi/inert';

dotenv.config({
    path: path.join(__dirname, '../.env')
})

const srv = hapi.server({
    port: 5000,
    routes: {
        cors: {
            origin: ['*']
        },
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


    srv.start().then(() => {
        console.log('started');
        console.log(process.env.ADMIN_TOKEN)
    })
})


makeAdminAuth(srv);
makeUserAuth(srv);