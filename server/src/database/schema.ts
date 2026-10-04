import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  role: text("role").notNull().default("patient"), // "patient" | "pharmacist" | "admin"
  insuranceType: text("insurance_type").default("تامین اجتماعی"),
  nationalId: text("national_id"),
  city: text("city").default("تهران"),
  neighborhood: text("neighborhood").default("ونک"),
  address: text("address"),
  latitude: numeric("latitude").default("35.7575"),
  longitude: numeric("longitude").default("51.4099"),
  allergies: text("allergies"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const manufacturers = pgTable("manufacturers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  persianName: text("persian_name").notNull(),
  country: text("country").notNull(),
  qualityTier: text("quality_tier").notNull().default("A"), // A+, A, B, C
  qualityScore: integer("quality_score").notNull().default(85), // 1 to 100
  reputationNotes: text("reputation_notes"),
  isIranian: boolean("is_iranian").notNull().default(false),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  genericName: text("generic_name").notNull(),
  persianName: text("persian_name").notNull(),
  brandName: text("brand_name").notNull(),
  category: text("category").notNull(),
  isRare: boolean("is_rare").notNull().default(false),
  isColdChain: boolean("is_cold_chain").notNull().default(false),
  requiresPrescription: boolean("requires_prescription").notNull().default(true),
  dosageForm: text("dosage_form").notNull(),
  dosageStrength: text("dosage_strength").notNull(),
  manufacturerId: integer("manufacturer_id").references(() => manufacturers.id),
  alternativeMedicationIds: jsonb("alternative_medication_ids").$type<number[]>().default([]),
  officialPrice: integer("official_price").notNull(),
  usageSummary: text("usage_summary").notNull(),
  sideEffects: text("side_effects"),
  storageCondition: text("storage_condition").default("دمای ۱۵ تا ۲۵ درجه سانتی‌گراد"),
  ifdaStatus: text("ifda_status").default("دارای مجوز رسمی سازمان غذا و دارو"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  licenseType: text("license_type").default("شبانه‌روزی"),
  city: text("city").notNull(),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  mobile: text("mobile"),
  whatsapp: text("whatsapp"),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  is24h: boolean("is_24h").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(true),
  rating: numeric("rating").default("4.8"),
  totalReviews: integer("total_reviews").default(0),
  insuranceAccepted: jsonb("insurance_accepted").$type<string[]>().default(["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح"]),
  deliveryAvailable: boolean("delivery_available").notNull().default(true),
  pharmacistInCharge: text("pharmacist_in_charge"),
  emergencyHotlineNote: text("emergency_hotline_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacyInventory = pgTable("pharmacy_inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").notNull().references(() => pharmacies.id, { onDelete: "cascade" }),
  medicationId: integer("medication_id").notNull().references(() => medications.id, { onDelete: "cascade" }),
  stockStatus: text("stock_status").notNull().default("in_stock"),
  stockQuantity: integer("stock_quantity").notNull().default(10),
  price: integer("price").notNull(),
  discountPercent: integer("discount_percent").default(0),
  batchExpiryDate: text("batch_expiry_date").default("2026-12"),
  lastVerifiedAt: timestamp("last_verified_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  patientName: text("patient_name").notNull(),
  nationalId: text("national_id").notNull(),
  trackingCode: text("tracking_code"),
  doctorName: text("doctor_name"),
  imageUrl: text("image_url"),
  itemsJson: jsonb("items_json").$type<Array<{ drugName: string; dosage?: string; count?: number; matchedMedicationId?: number }>>().default([]),
  status: text("status").notNull().default("analyzed"),
  city: text("city").notNull().default("تهران"),
  userPhone: text("user_phone").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pharmacyId: integer("pharmacy_id").notNull().references(() => pharmacies.id),
  medicationId: integer("medication_id").references(() => medications.id),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("pending_review"),
  deliveryType: text("delivery_type").notNull().default("pickup"),
  userPhone: text("user_phone").notNull(),
  userAddress: text("user_address"),
  patientNotes: text("patient_notes"),
  pharmacistNotes: text("pharmacist_notes"),
  reservedUntil: timestamp("reserved_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rareDrugAlerts = pgTable("rare_drug_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  city: text("city").notNull().default("تهران"),
  maxDistanceKm: integer("max_distance_km").default(25),
  userPhone: text("user_phone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notifiedCount: integer("notified_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacyReviews = pgTable("pharmacy_reviews", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").notNull().references(() => pharmacies.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull().default(5),
  stockAccuracyScore: integer("stock_accuracy_score").default(5),
  pharmacistServiceScore: integer("pharmacist_service_score").default(5),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  city: text("city").default("تهران"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // "user" | "assistant"
  message: text("message").notNull(),
  intent: text("intent"),
  structuredData: jsonb("structured_data").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
