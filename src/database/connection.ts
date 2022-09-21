import mongoose from "mongoose";
import userSchema from "./userSchema";
import productsSchema from "./productsSchema";
import guestCartSchema from './guestCartSchema';

const host = process.env.MONGO_HOST || "localhost";
const port = process.env.MONGO_PORT || 27017;
const dbName = "datbaseShop";

// const uri = `mongodb://172.18.0.2:27017/${dbName}`;
const uri = `mongodb://${host}:${port}/${dbName}`;


mongoose.connect(uri);

const db = mongoose.connection;
db.on("error", () => {
	console.error("Произошла ошибка при подключении к монге");
});

db.once("open", () => {
	console.log("Успешно подключились к монге");
});

const user = mongoose.model("user", userSchema);
const products = mongoose.model("products", productsSchema);
const guestCart = mongoose.model("guestCart", guestCartSchema);

export default {
	user,
	products,
	guestCart
};
