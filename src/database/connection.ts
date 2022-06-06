import { options } from "joi";
import mongoose from "mongoose";
import userSchema from './userSchema';

const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || 27017;
const dbName = 'datbaseShop';

const uri = `mongodb://${host}:${port}/${dbName}`;

mongoose.connect(uri)


const db = mongoose.connection;
db.on('error', () => {
    console.error('Произошла ошибка при подключении к монге');
})

db.once('open', () => {
    console.log('Успешно подключились к монге');
});


const user = mongoose.model('user', userSchema);

export default {
    user
};
