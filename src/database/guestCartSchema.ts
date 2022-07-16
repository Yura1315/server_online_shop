import mongoose from "mongoose";

interface IguestCart {
  guestIp: string
  guestId: string
  guestCart: any[]
}

const schema = new mongoose.Schema<IguestCart>({
  guestIp: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  guestCart: {
    type: mongoose.Schema.Types.Array,
    required: false
  }
})

export default schema;