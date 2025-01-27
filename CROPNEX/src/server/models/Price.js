import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  commodity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commodity',
    required: true
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

export default mongoose.model('Price', priceSchema);