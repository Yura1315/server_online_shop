import { string } from "joi";
import mongoose from "mongoose";
import { emit } from "process";
import { v4 as uuidv4 } from 'uuid';

interface Iuser {
    email: string,
    password: string,
    token: string

}

const schema = new mongoose.Schema<Iuser>(
    {
        email: {
            type: mongoose.Schema.Types.String,
            required: true
        },
        password: {
            type:mongoose.Schema.Types.String,
            required: true
        },
        token: {
            type: mongoose.Schema.Types.String,
            default: uuidv4,
        }
    },
    {
        timestamps: true
    }
)

export default schema;