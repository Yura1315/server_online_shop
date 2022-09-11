import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface Iuser {
	name: string;
	email: string;
	password: string;
	phone?: string;
	token: string;
	whishList?: string[];
	boughtList?: string[];
	birthDay: string;
	lastName: string;
	middleName: string;
	cart: any[]
}

const schema = new mongoose.Schema<Iuser>(
	{
		name: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		email: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		phone: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		password: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		token: {
			type: mongoose.Schema.Types.String,
			default: uuidv4,
		},
		whishList: {
			type: mongoose.Schema.Types.Mixed,
			required: false,
		},
		boughtList: {
			type: mongoose.Schema.Types.Mixed,
			required: false,
		},
		birthDay: {
			type: mongoose.Schema.Types.String,
			required: false,
		},
		lastName: {
			type: mongoose.Schema.Types.String,
			required: false,
		},
		middleName: {
			type: mongoose.Schema.Types.String,
		},
		cart: {
			type: mongoose.Schema.Types.Mixed,
			required: false
		}
	},
	{
		timestamps: true,
	}
);

export default schema;
