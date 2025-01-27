import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  commodities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commodity'
  }]
});

export default mongoose.model('Market', marketSchema);