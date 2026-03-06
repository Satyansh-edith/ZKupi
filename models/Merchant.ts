import mongoose from "mongoose"

const MerchantSchema = new mongoose.Schema({
  name: String,
  merchantId: String,
  balance: {
    type: Number,
    default: 0
  }
})

export default mongoose.models.Merchant ||
  mongoose.model("Merchant", MerchantSchema)