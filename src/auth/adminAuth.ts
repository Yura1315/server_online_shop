import hapi from '@hapi/hapi';

export default function (srv: hapi.Server) {
    srv.auth.strategy('admin', 'bearer-access-token', {
        validate: (req: hapi.Request, token: string, h: hapi.ResponseToolkit) => {
            console.log('in validate', token)
            const isValid = process.env.ADMIN_TOKEN == token
            return {
                isValid,
                credentials: {},
                artifacts: {}
            }
        }
    });
}

