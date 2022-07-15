import { Location } from 'hapi-geo-locate';
import * as hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import database from "./database/connection";
import { v4 as uuidv4 } from "uuid";
import { generateHash } from "./helpers";
import { Query } from "mongoose";

export default {
	auth: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const { email, password } = req.payload as {
				email: string;
				password: string;
			};
			//Поиск в БД пользователя
			const foundUser = await database.user.findOne({ email });
			if (!foundUser) {
				const errEmail = Boom.badRequest("Не удалось найти пользователя");
				return h.response(errEmail.output);
			}
			if (foundUser.password !== generateHash(password)) {
				const errPass = Boom.badRequest("Неверный пароль");
				return h.response(errPass.output);
			}
			return h.response(foundUser);
		} catch (error) {
			return Boom.badImplementation(
				"Произошла ошибка при авторизации, попробуйте позднее"
			);
		}
	},
	reg: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const { email, password, phone, name } = req.payload as {
				email: string;
				password: string;
				phone: string;
				name: string;
			};
			const alreadyRegistered = await database.user.findOne({ email });
			if (alreadyRegistered) {
				const err = Boom.badRequest("Данный email уже зарегистрирован");
				return h.response(err.output);
			} else {
				const user = {
					name,
					email,
					password: generateHash(password),
					phone,
					userId: uuidv4(),
					token: uuidv4(),
					middleName: "",
					lastName: "",
					gender: "",
					cart: []
				};
				await database.user.create(user);
				const res = {
					name: user.name,
					token: user.token,
					email: user.email,
					phone: user.phone,
					userId: user.userId,
					cart: user.cart
				};
				return h.response(res);
			}
		} catch (e) {
			return Boom.badImplementation(
				"Произошла ошибка при регистрации, попробуйте позже"
			);
		}
	},
	editProfile: async (req: hapi.Request, hapi: hapi.ResponseToolkit) => {
		const userToken = req.auth.credentials.token;
		console.log(userToken);
		const { name, email, password, phone, middleName, lastName, birthDay } =
			req.payload as {
				email: string;
				lastName: string;
				middleName: string;
				password: string;
				phone: string;
				name: string;
				birthDay: string;
			};
		try {
			const user = await database.user.updateOne(
				{ token: userToken },
				{
					$set: {
						name: name,
						lastName: lastName,
						middleName: middleName,
						email: email,
						phone: phone,
						birthDay: birthDay,
						password: generateHash(password),
					},
				}
			);
			const newUser = await database.user.findOne({ token: userToken });
			return newUser;
		} catch (err) {
			console.log(err);
		}
	},
	popularProducts: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const products = await database.products.find({}, { _id: 0 }).sort({ bought: -1 }).limit(8);
			return h.response(products);
		} catch (err) {
			console.log(err);
		}
	},
	getProductsPage: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const perPage = +req.query.perPage;
		const category = req.params.category
		const page = +req.query.page;
		const firstIndex = page * perPage - perPage;
		try {
			const count = await database.products.find({ category: category }).count();
			const products = await database.products.find({ category: category }).skip(firstIndex).limit(perPage);
			const res = {
				products: products,
				totalCount: count,
				perPage,
				currentPage: page
			}
			return res
		} catch (err) {
			console.log(err)
		}
	},
	oneProduct: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const product = await database.products.findOne(
				{ id: +req.params.id }
				// { _id: false }
			);
			return h.response({ product });
		} catch (err) {
			console.log(err);
		}
	},
	addWhishList: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const { email, productId } = req.payload as {
			email: string;
			productId: string;
		};
		try {
			const user = await database.user.findOne({ email });
			if (user?.whishList?.includes(productId)) {
				await database.user.updateOne(
					{ email },
					{ $pull: { whishList: productId } }
				);
			} else {
				await database.user.updateOne(
					{ email },
					{ $push: { whishList: productId } }
				);
			}

			const newWhishList = await database.user.findOne({ email });
			return newWhishList?.whishList;
		} catch (err) {
			return Boom.internal("Непридвиденная ошибка, попробуйте позже");
		}
	},
	getWhishProducts: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const userToken = req.headers.authorization.split(" ")[1];
		try {
			const userWhishlist = await database.products.find({
				_id: { $in: req.auth.credentials.whishList },
			});
			return userWhishlist;
		} catch (err) {
			console.log(err);
		}
	},
	getToken: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const user = req.auth.credentials;
		if (user) {
			return user;
		} else {
			return Boom.unauthorized("Пользователь не авторизован");
		}
	},
	getUserCart: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const user = req.auth.credentials;
		try {
			return user.cart
		} catch (err) {
			console.log(err);
		}
	},
	addCart: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const { email, productId } = req.payload as { email: string, productId: string }
		const guestIp = req.info.remoteAddress
		try {
			if (!email) {
				const guest = await database.guestCart.findOne({ guestIp })
				if (!guest) {
					const guestUser = {
						guestIp: req.info.remoteAddress,
						guestId: uuidv4(),
						guestCart: [productId]
					}
					return guestUser
				}
				const guestCart = await database.guestCart.updateOne({ guestIp }, { $push: { guestCart: productId } })
				return 'ok'
			} else {
				await database.user.updateOne({ email }, { $push: { cart: productId } })
				const user = await database.user.findOne({ email });
				return user?.cart
			}
		} catch (err) {
			console.log(err);
		}
	}
};
