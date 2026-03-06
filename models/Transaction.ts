import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema({
  commitment: String,
  merchantId: String,
  amount: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Transaction ||
mongoose.model("Transaction", TransactionSchema)