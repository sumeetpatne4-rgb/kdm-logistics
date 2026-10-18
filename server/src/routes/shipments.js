import { Router } from "express";
import crypto from "node:crypto";
import Shipment from "../models/Shipment.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
const services = ["Road Freight", "Express Delivery", "Warehousing", "Supply Chain"];
const statuses = ["Quote Requested", "Confirmed", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "On Hold"];
const makeTrackingId = () => `KDM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

router.get("/track/:trackingId", async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId.toUpperCase() });
    if (!shipment) return res.status(404).json({ message: "We couldn't find that tracking number. Check it and try again." });
    res.json({ shipment: {
      trackingId: shipment.trackingId, service: shipment.service, origin: shipment.origin,
      destination: shipment.destination, pickupDate: shipment.pickupDate,
      status: shipment.status, createdAt: shipment.createdAt, updatedAt: shipment.updatedAt
    }});
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { service, origin, destination, pickupDate, packageType, weightKg, notes } = req.body;
    if (!services.includes(service)) return res.status(400).json({ message: "Choose a valid logistics service." });
    if (![origin, destination, pickupDate, packageType].every(v => String(v || "").trim())) return res.status(400).json({ message: "Complete all required shipment fields." });
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) return res.status(400).json({ message: "Origin and destination must be different." });
    const weight = Number(weightKg);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100000) return res.status(400).json({ message: "Enter a valid shipment weight." });
    const date = new Date(pickupDate);
    if (Number.isNaN(date.getTime())) return res.status(400).json({ message: "Enter a valid pickup date." });
    let trackingId = makeTrackingId();
    while (await Shipment.exists({ trackingId })) trackingId = makeTrackingId();
    const shipment = await Shipment.create({
      trackingId, customer: req.user._id, customerName: req.user.name, customerEmail: req.user.email,
      service, origin: origin.trim(), destination: destination.trim(), pickupDate: date,
      packageType: packageType.trim(), weightKg: weight, notes: String(notes || "").trim()
    });
    res.status(201).json({ message: "Quote request submitted.", shipment });
  } catch (error) { next(error); }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ shipments });
  } catch (error) { next(error); }
});

router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.search) {
      const q = String(req.query.search).slice(0, 100);
      filter.$or = [
        { trackingId: { $regex: q, $options: "i" } }, { customerName: { $regex: q, $options: "i" } },
        { origin: { $regex: q, $options: "i" } }, { destination: { $regex: q, $options: "i" } }
      ];
    }
    const shipments = await Shipment.find(filter).sort({ createdAt: -1 }).limit(300);
    res.json({ shipments });
  } catch (error) { next(error); }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, adminNote = "" } = req.body;
    if (!statuses.includes(status)) return res.status(400).json({ message: "Choose a valid shipment status." });
    if (String(adminNote).length > 1000) return res.status(400).json({ message: "Admin note is too long." });
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, { status, adminNote: String(adminNote).trim() }, { new: true, runValidators: true });
    if (!shipment) return res.status(404).json({ message: "Shipment not found." });
    res.json({ message: "Shipment updated.", shipment });
  } catch (error) { next(error); }
});

export default router;
