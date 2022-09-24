import * as hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import database from "./database/connection";
import { v4 as uuidv4 } from "uuid";
import { assignCart, generateHash } from "./helpers";

export default {
	auth: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const { email, password, cartInfo } = req.payload as {
				email: string;
				password: string;
				cartInfo: any[];
			};
			// Поиск в БД пользователя
			const foundUser = await database.user.findOne({ email });
			if (!foundUser) {
				const errEmail = Boom.badRequest("Не удалось найти пользователя");
				return h.response(errEmail.output);
			}
			if (foundUser.password !== generateHash(password)) {
				const errPass = Boom.badRequest("Неверный пароль");
				return h.response(errPass.output);
			}
			// const newCart = assignCart(foundUser.cart, cartInfo);
			// const guestIp = req.info.remoteAddress;
			// await database.user.updateOne({ email: email }, { $set: { cart: [] } });
			// await database.user.updateOne({ email: email }, { $set: { cart: [...newCart] } });
			// await database.guestCart.updateOne({ guestIp: guestIp }, { $set: { guestCart: [] } });
			// const user = await database.user.findOne({ email })
			// return user

			if (cartInfo.length > 0) {
				const guestIp = req.info.remoteAddress
				const guestCart = await database.guestCart.findOne({ guestIp });
				// await database.guestCart.updateOne({ guestIp }, { $set: { guestCart: [] } });
				const userCart = await database.user.findOne({ email })
				if (!userCart?.cart.length) {
					await database.user.updateOne({ email }, { $set: { cart: [...guestCart!.guestCart] } })
					await database.guestCart.updateOne({ guestIp }, { $set: { guestCart: [] } });
					const user = await database.user.findOne({ email })
					return user
				}
				const newCart = assignCart(userCart?.cart, guestCart?.guestCart)
				await database.user.updateOne({ email }, { $set: { cart: [] } })
				await database.user.updateOne({ email }, { $set: { cart: [...newCart] } })
				const user = await database.user.findOne({ email })
				return user
			}
			return foundUser;
		} catch (error) {
			return Boom.badImplementation(
				"Произошла ошибка при авторизации, попробуйте позднее"
			);
		}
	},
	reg: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		try {
			const { email, password, phone, name, cart } = req.payload as {
				email: string;
				password: string;
				phone: string;
				name: string;
				cart: any[];
			};
			const guestIp = req.info.remoteAddress
			const alreadyRegistered = await database.user.findOne({ email });
			const guest = await database.guestCart.findOne({ guestIp })
			if (alreadyRegistered) {
				const err = Boom.badRequest("Данный email уже зарегистрирован");
				return h.response(err.output);
			}
			if (!cart.length) {
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
					cart: [],
					whishList: [],
					birthDay: '',
				};
				await database.user.create(user);
				const res = {
					name: user.name,
					token: user.token,
					email: user.email,
					phone: user.phone,
					userId: user.userId,
					cart: user.cart,
					whishList: user.whishList,
					birthDay: user.birthDay,
					gender: user.gender,
					middleName: user.middleName,
					lastName: user.lastName
				};
				return h.response(res);
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
					birthDay: "",
					cart: [...cart],
					whishList: []
				};
				await database.user.create(user);
				await database.guestCart.updateOne({ guestIp }, { $set: { guestCart: [] } })
				const res = {
					name: user.name,
					token: user.token,
					email: user.email,
					phone: user.phone,
					userId: user.userId,
					cart: user.cart,
					whishList: user.whishList
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
			const products = await database.products.find({}).sort({ bought: -1 }).limit(8);
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
	addCart: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const { email, cart } = req.payload as { email: string, cart: { _id: string, count: number, title: string, price: number, alt: string, src: string[], article: number, id: number, category: string[], char: any[], descr: string, bought: number } }
		const guestIp = req.info.remoteAddress
		try {
			if (!email) {
				const guest = await database.guestCart.findOne({ guestIp })
				if (!guest) {
					const guestUser = {
						guestIp: req.info.remoteAddress,
						guestId: uuidv4(),
						guestCart: [cart]
					}
					await database.guestCart.create(guestUser);
					return guestUser.guestCart
				} else if (guest) {
					const allreadyCartGuest = await database.guestCart.findOne({ guestIp, guestCart: { $elemMatch: { _id: cart._id } } })
					if (allreadyCartGuest) {
						await database.guestCart.updateOne({ guestIp, "guestCart._id": cart._id }, { $set: { "guestCart.$.count": cart.count } })
						const guestRes = await database.guestCart.findOne({ guestIp })
						return guestRes?.guestCart
					} else {
						await database.guestCart.updateOne({ guestIp }, { $push: { guestCart: cart } })
						const guestRes = await database.guestCart.findOne({ guestIp })
						return guestRes?.guestCart
					}
				}
			} else if (email) {
				const allreadyCart = await database.user.findOne({ email, cart: { $elemMatch: { _id: cart._id } } })
				if (allreadyCart) {
					await database.user.updateOne({ email: email, "cart._id": cart._id }, { $set: { "cart.$.count": cart.count } })
					const user = await database.user.findOne({ email });
					return user?.cart
				}
			}
			await database.user.updateOne({ email }, { $push: { cart: cart } })
			const user = await database.user.findOne({ email });
			return user?.cart
		} catch (err) {
			console.log(err);
		}
	},
	delCart: async (req: hapi.Request, h: hapi.ResponseToolkit) => {
		const { email, product } = req.payload as { email: string, product: { _id: string, count: number, title: string, price: number, alt: string, src: [string], article: string, id: string, category: [string], char: [string], descr: string, bought: number } }
		const guestIp = req.info.remoteAddress
		try {
			if (!email) {
				const guest = await database.guestCart.findOne({ guestIp })
				if (guest) {
					await database.guestCart.updateOne({ guestIp }, { $pull: { guestCart: product } })
					const newGuestCart = await database.guestCart.findOne({ guestIp });
					return newGuestCart?.guestCart
				} else {
					return Boom.internal('Неожиданная ошибка');
				}
			} else if (email) {
				const user = await database.user.findOne({ email })
				if (user) {
					await database.user.updateOne({ email }, { $pull: { cart: product } })
					const newCart = await database.user.findOne({ email });
					return newCart?.cart
				} else {
					return Boom.internal('Неожиданная ошибка')
				}
			}
		} catch (err) {
			console.log(err);
		}
	}
};
