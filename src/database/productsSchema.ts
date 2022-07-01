import mongoose from "mongoose";

interface Iproducts {
	id: number;
	title: string;
	alt: string;
	category: [string];
	src: [string];
	char: any[];
	descr: string;
	price: number;
	article: number;
	bought: number;
}

const schema = new mongoose.Schema<Iproducts>({
	id: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	title: {
		type: mongoose.Schema.Types.String,
		required: true,
	},
	alt: {
		type: mongoose.Schema.Types.String,
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.Array,
		required: true,
	},
	src: {
		type: mongoose.Schema.Types.Array,
		required: true,
	},
	char: {
		type: mongoose.Schema.Types.Array,
		required: true,
	},
	descr: {
		type: mongoose.Schema.Types.String,
		required: true,
	},
	price: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	article: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
	bought: {
		type: mongoose.Schema.Types.Number,
		required: true,
	},
});

export default schema;
