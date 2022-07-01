import * as Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import database from "../database/connection";

export default function (srv: hapi.Server) {
	srv.auth.strategy("user", "bearer-access-token", {
		validate: async (
			req: hapi.Request,
			token: string,
			h: hapi.ResponseToolkit
		) => {
			try {
				const user = await database.user.findOne(
					{ token },
					{ password: false }
				);
				if (user) {
					return {
						isValid: true,
						credentials: user,
						artifacts: {},
					};
				} else {
					return {
						isValid: false,
						credentials: user,
						artifacts: {},
					};
				}
			} catch (err) {
				console.log(err);
			}
		},
	});
}
