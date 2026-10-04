import { Schema, model, Types } from "mongoose";

/* --------------------------------------------------------------------------
 * Auto-increment counters so every document gets a stable numeric id — this
 * keeps the JSON API 100% backward compatible with the previous Postgres
 * implementation (the Vue 3 client expects numeric `id` fields).
 * ------------------------------------------------------------------------ */

const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { collection: "counters", versionKey: false },
);

export const Counter = model("Counter", CounterSchema);

export async function nextSeq(name: string): Promise<number> {
  const res = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return res!.seq;
}

/* --------------------------------------------------------------------------
 * Shared plugin: assigns an auto-increment numeric `id` on insert
 * and normalises JSON output to `{ id, ..., createdAt }` (no `_id`, `__v`).
 * ------------------------------------------------------------------------ */

function autoIncPlugin(collectionName: string) {
  return function (schema: Schema) {
    schema.add({ id: { type: Number, unique: true, index: true } });
    schema.pre("save", async function (next) {
      const self: any = this;
      if (self.isNew && (self.id === undefined || self.id === null)) {
        self.id = await nextSeq(collectionName);
      }
      next();
    });
    // `insertMany` bypasses `pre('save')`, so we assign IDs eagerly.
    schema.pre("insertMany", async function (next: any, docs: any[]) {
      if (!Array.isArray(docs) || docs.length === 0) return next();
      for (const doc of docs) {
        if (doc && (doc.id === undefined || doc.id === null)) {
          doc.id = await nextSeq(collectionName);
        }
      }
      next();
    });
    schema.set("toJSON", {
      virtuals: false,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    });
    schema.set("toObject", {
      virtuals: false,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    });
  };
}

/* -------------------------------- Users --------------------------------- */

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    role: { type: String, default: "patient" }, // patient | pharmacist | admin
    insuranceType: { type: String, default: "تامین اجتماعی" },
    nationalId: { type: String },
    city: { type: String, default: "تهران" },
    neighborhood: { type: String, default: "ونک" },
    address: { type: String },
    latitude: { type: Number, default: 35.7575 },
    longitude: { type: Number, default: 51.4099 },
    allergies: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users", versionKey: false },
);
UserSchema.plugin(autoIncPlugin("users"));
export const User = model("User", UserSchema);

/* ---------------------------- Manufacturers ----------------------------- */

const ManufacturerSchema = new Schema(
  {
    name: { type: String, required: true },
    persianName: { type: String, required: true },
    country: { type: String, required: true },
    qualityTier: { type: String, default: "A" }, // A+, A, B, C
    qualityScore: { type: Number, default: 85 }, // 1..100
    reputationNotes: { type: String },
    isIranian: { type: Boolean, default: false },
    website: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "manufacturers", versionKey: false },
);
ManufacturerSchema.plugin(autoIncPlugin("manufacturers"));
export const Manufacturer = model("Manufacturer", ManufacturerSchema);

/* ----------------------------- Medications ------------------------------ */

const MedicationSchema = new Schema(
  {
    genericName: { type: String, required: true },
    persianName: { type: String, required: true },
    brandName: { type: String, required: true },
    category: { type: String, required: true },
    isRare: { type: Boolean, default: false },
    isColdChain: { type: Boolean, default: false },
    requiresPrescription: { type: Boolean, default: true },
    dosageForm: { type: String, required: true },
    dosageStrength: { type: String, required: true },
    manufacturerId: { type: Number, index: true },
    alternativeMedicationIds: { type: [Number], default: [] },
    officialPrice: { type: Number, required: true },
    usageSummary: { type: String, required: true },
    sideEffects: { type: String },
    storageCondition: {
      type: String,
      default: "دمای ۱۵ تا ۲۵ درجه سانتی‌گراد",
    },
    ifdaStatus: { type: String, default: "دارای مجوز رسمی سازمان غذا و دارو" },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "medications", versionKey: false },
);
MedicationSchema.plugin(autoIncPlugin("medications"));
export const Medication = model("Medication", MedicationSchema);

/* ------------------------------ Pharmacies ------------------------------ */

const PharmacySchema = new Schema(
  {
    userId: { type: Number, index: true },
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseType: { type: String, default: "داروخانه روزانه" },
    city: { type: String, required: true },
    neighborhood: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    mobile: { type: String },
    whatsapp: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    // مختصات استاندارد GeoJSON برای کوئری‌های مکانی با کارایی بسیار بالا:
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // ترتیب الزامی در استاندارد ژئو: [longitude, latitude]
        required: true,
      },
    },
    is24h: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    totalReviews: { type: Number, default: 0 },
    insuranceAccepted: {
      type: [String],
      default: ["تأمین اجتماعی", "خدمات درمانی", "سلامت"],
    },
    deliveryAvailable: { type: Boolean, default: true },
    pharmacistInCharge: { type: String },
    emergencyHotlineNote: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "pharmacies", versionKey: false },
);
PharmacySchema.plugin(autoIncPlugin("pharmacies"));
export const Pharmacy = model("Pharmacy", PharmacySchema);

/* -------------------------- Pharmacy Inventory -------------------------- */

const PharmacyInventorySchema = new Schema(
  {
    pharmacyId: { type: Number, required: true, index: true },
    medicationId: { type: Number, required: true, index: true },
    stockStatus: { type: String, default: "in_stock" },
    stockQuantity: { type: Number, default: 10 },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    batchExpiryDate: { type: String, default: "2026-12" },
    lastVerifiedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { collection: "pharmacy_inventory", versionKey: false },
);
PharmacyInventorySchema.plugin(autoIncPlugin("pharmacy_inventory"));
export const PharmacyInventory = model(
  "PharmacyInventory",
  PharmacyInventorySchema,
);

/* ----------------------------- Prescriptions ---------------------------- */

const PrescriptionSchema = new Schema(
  {
    userId: { type: Number, index: true },
    patientName: { type: String, required: true },
    nationalId: { type: String, required: true },
    trackingCode: { type: String },
    doctorName: { type: String },
    imageUrl: { type: String },
    itemsJson: {
      type: [
        {
          drugName: String,
          dosage: String,
          count: Number,
          matchedMedicationId: Number,
        },
      ],
      default: [],
    },
    status: { type: String, default: "analyzed" },
    city: { type: String, default: "تهران" },
    userPhone: { type: String, required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "prescriptions", versionKey: false },
);
PrescriptionSchema.plugin(autoIncPlugin("prescriptions"));
export const Prescription = model("Prescription", PrescriptionSchema);

/* ----------------------------- Reservations ----------------------------- */

const ReservationSchema = new Schema(
  {
    userId: { type: Number, index: true },
    pharmacyId: { type: Number, required: true, index: true },
    medicationId: { type: Number, index: true },
    prescriptionId: { type: Number },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "pending_review" },
    deliveryType: { type: String, default: "pickup" },
    userPhone: { type: String, required: true },
    userAddress: { type: String },
    patientNotes: { type: String },
    pharmacistNotes: { type: String },
    reservedUntil: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "reservations", versionKey: false },
);
ReservationSchema.plugin(autoIncPlugin("reservations"));
export const Reservation = model("Reservation", ReservationSchema);

/* -------------------------- Rare Drug Alerts ---------------------------- */

const RareDrugAlertSchema = new Schema(
  {
    userId: { type: Number, index: true },
    medicationId: { type: Number, required: true, index: true },
    city: { type: String, default: "تهران" },
    maxDistanceKm: { type: Number, default: 25 },
    userPhone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    notifiedCount: { type: Number, default: 0 },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "rare_drug_alerts", versionKey: false },
);
RareDrugAlertSchema.plugin(autoIncPlugin("rare_drug_alerts"));
export const RareDrugAlert = model("RareDrugAlert", RareDrugAlertSchema);

/* --------------------------- Pharmacy Reviews --------------------------- */

const PharmacyReviewSchema = new Schema(
  {
    pharmacyId: { type: Number, required: true, index: true },
    userId: { type: Number },
    userName: { type: String, required: true },
    rating: { type: Number, default: 5 },
    stockAccuracyScore: { type: Number, default: 5 },
    pharmacistServiceScore: { type: Number, default: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "pharmacy_reviews", versionKey: false },
);
PharmacyReviewSchema.plugin(autoIncPlugin("pharmacy_reviews"));
export const PharmacyReview = model("PharmacyReview", PharmacyReviewSchema);

/* -------------------------- Chat conversations -------------------------- */

const ChatConversationSchema = new Schema(
  {
    userId: { type: Number, index: true },
    title: { type: String, required: true },
    city: { type: String, default: "تهران" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "chat_conversations", versionKey: false },
);
ChatConversationSchema.plugin(autoIncPlugin("chat_conversations"));
export const ChatConversation = model(
  "ChatConversation",
  ChatConversationSchema,
);

const ChatMessageSchema = new Schema(
  {
    conversationId: { type: Number, required: true, index: true },
    sender: { type: String, required: true }, // user | assistant
    message: { type: String, required: true },
    intent: { type: String },
    structuredData: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "chat_messages", versionKey: false },
);
ChatMessageSchema.plugin(autoIncPlugin("chat_messages"));
export const ChatMessage = model("ChatMessage", ChatMessageSchema);

/* ------------------------------ Utilities ------------------------------- */

export type LeanDoc<T> = T & { id: number; createdAt?: Date };

// Turn a Mongoose doc (or array) into a clean JSON-ready plain object.
export function clean<T = any>(doc: any): T {
  if (doc == null) return doc;
  if (Array.isArray(doc)) return doc.map((d) => clean(d)) as any;
  if (typeof doc?.toObject === "function") {
    const o = doc.toObject();
    delete o._id;
    delete o.__v;
    return o as T;
  }
  const o = { ...doc };
  delete o._id;
  delete o.__v;
  return o as T;
}

// Placeholder — kept so schema file exports Types for future population helpers
export const _ObjectId = Types.ObjectId;
