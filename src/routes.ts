import * as hapi from "@hapi/hapi";
import joi from "joi";
import controlers from "./controlers";

const routes: hapi.ServerRoute[] = [
	{
		method: "GET",
		path: "/",
		handler: (req: hapi.Request) => {
			return "product";
		},
	},
	{
		method: "POST",
		path: "/logged/reg",
		handler: controlers.reg,
		options: {
			validate: {
				payload: joi.object({
					name: joi.string().required(),
					email: joi.string().email().required(),
					phone: joi.string().required(),
					password: joi.string().required(),
				}),
			},
		},
	},
	{
		method: "PUT",
		path: "/profile/edit",
		options: {
			auth: {
				strategy: "user",
			},
		},
		handler: controlers.editProfile,
	},
	{
		method: "POST",
		path: "/logged/auth",
		handler: controlers.auth,
		options: {
			validate: {
				payload: joi.object({
					email: joi.string().required(),
					password: joi.string().required(),
					cartInfo: joi.array(),
				}),
			},
		},
	},
	{
		method: "GET",
		path: "/popular",
		handler: controlers.popularProducts,
	},
	{
		method: "GET",
		path: "/catalog/{category}",
		handler: controlers.getProductsPage,
	},
	{
		method: "GET",
		path: "/product/{id}",
		handler: controlers.oneProduct,
	},
	{
		method: "PUT",
		path: "/product/{id}",
		handler: controlers.addWhishList,
	},
	{
		method: "GET",
		path: "/profile",
		handler: controlers.getToken,
		options: {
			auth: {
				strategy: "user",
			},
		},
	},
	{
		method: "GET",
		path: "/profile/whishlist",
		options: {
			auth: {
				strategy: "user",
			},
		},
		handler: controlers.getWhishProducts,
	},
	{
		method: "GET",
		path: "/admin",
		handler: (req: hapi.Request, h: hapi.ResponseToolkit) => {
			return {
				name: "vasya",
				surname: "pupkin",
				isAdmin: true,
			};
		},
		options: {
			auth: {
				strategy: "admin",
			},
		},
	},
	{
		method: "PUT",
		path: '/addCart',
		handler: controlers.addCart
	},
	{
		method: 'PUT',
		path: '/delCart',
		handler: controlers.delCart
	}
];

export default routes;
