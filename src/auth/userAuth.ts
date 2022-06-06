import hapi from '@hapi/hapi';
import database from '../database/connection';

export default function (srv: hapi.Server) {
    srv.auth.strategy('user', 'bearer-access-token', {
        validate: async (req: hapi.Request, token: string, h: hapi.ResponseToolkit) => {
            const user = await database.user.findOne({ token });
            console.log('in validate', token)
            if (user) {
                return {
                    isValid: true,
                    credentials: user,
                    artifacts: {}
                }
            }
            return {
                isValid: false,
                credentials: user,
                artifacts: {}
            }
        }
    });
}