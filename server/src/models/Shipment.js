import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  service: { type: String, enum: ["Road Freight", "Express Delivery", "Warehousing", "Supply Chain"], required: true },
  origin: { type: String, required: true, trim: true, maxlength: 180 },
  destination: { type: String, required: true, trim: true, maxlength: 180 },
  pickupDate: { type: Date, required: true },
  packageType: { type: String, required: true, trim: true, maxlength: 100 },
  weightKg: { type: Number, required: true, min: 0.1, max: 100000 },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Quote Requested", "Confirmed", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "On Hold"], default: "Quote Requested" },
  adminNote: { type: String, trim: true, maxlength: 1000, default: "" }
}, { timestamps: true });

export default mongoose.model("Shipment", shipmentSchema);
