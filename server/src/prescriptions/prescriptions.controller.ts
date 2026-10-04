import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Prescription, User, Medication, Pharmacy, PharmacyInventory } from "../database/models";
import { calculateDistanceKm, estimateTravelMinutes } from "../ai/ai.service";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/prescriptions")
export class PrescriptionsController {
  @Get()
  async list(@Query("userId") userId?: string) {
    try {
      const filter: any = {};
      if (userId) filter.userId = Number(userId);
      const list = await Prescription.find(filter).sort({ createdAt: -1 }).lean();

      const userIds = Array.from(new Set(list.map((p: any) => p.userId).filter(Boolean)));
      const users = await User.find({ id: { $in: userIds } }).lean();
      const userById = new Map<number, any>();
      for (const u of users) userById.set((u as any).id, u);

      return {
        success: true,
        count: list.length,
        prescriptions: list.map((p: any) => ({
          prescription: sanitize(p),
          user: userById.get(p.userId) ? sanitize(userById.get(p.userId)) : null,
        })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    try {
      const p = await Prescription.findOne({ id: Number(id) }).lean();
      if (!p) return { success: false, error: "نسخه یافت نشد" };
      return { success: true, prescription: sanitize(p) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      const { patientName, nationalId, trackingCode, doctorName, imageUrl, itemsJson, city, userPhone, notes, userId } = body || {};
      if (!patientName || !nationalId || !userPhone) {
        return { success: false, error: "نام بیمار، کدملی و شماره تماس الزامی هستند" };
      }

      const created = await Prescription.create({
        userId: userId ? Number(userId) : undefined,
        patientName,
        nationalId,
        trackingCode: trackingCode || `RX-${Math.floor(10000 + Math.random() * 90000)}`,
        doctorName: doctorName || "پزشک معالج متخصص",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
        itemsJson: itemsJson || [],
        status: "analyzed",
        city: city || "تهران",
        userPhone,
        notes: notes || "",
      });
      return { success: true, prescription: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await Prescription.findOneAndUpdate(
        { id: Number(id) },
        {
          patientName: body.patientName,
          nationalId: body.nationalId,
          trackingCode: body.trackingCode,
          doctorName: body.doctorName,
          imageUrl: body.imageUrl,
          itemsJson: body.itemsJson,
          status: body.status,
          city: body.city,
          userPhone: body.userPhone,
          notes: body.notes,
        },
        { new: true },
      ).lean();
      return { success: true, prescription: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await Prescription.deleteOne({ id: Number(id) });
      return { success: true, message: "نسخه با موفقیت حذف گردید" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

@Controller("api/prescriptions/scan-ai")
export class PrescriptionsScanController {
  @Post()
  async scan(@Body() body: Record<string, any>) {
    try {
      const { trackingCode, nationalId, rawText, lat, lng } = body || {};
      const userLat = lat ? Number(lat) : 35.7575;
      const userLng = lng ? Number(lng) : 51.4099;

      const [allMeds, allPharmacies, allInventory] = await Promise.all([
        Medication.find({}).lean(),
        Pharmacy.find({}).lean(),
        PharmacyInventory.find({}).lean(),
      ]);

      const normalizedRaw = String(rawText || "").toLowerCase();
      let extractedItems: any[] = [];

      const pick = (predicate: (m: any) => boolean, fallbackIdx = 0) => (allMeds.find(predicate) as any) || (allMeds[fallbackIdx] as any);

      if (
        normalizedRaw.includes("انسولین") || normalizedRaw.includes("قند") ||
        (trackingCode && String(trackingCode).startsWith("RX-9"))
      ) {
        const lantus = pick((m: any) => m.brandName.includes("Lantus"));
        const metform = pick((m: any) => m.brandName.includes("Metformin"), 1);
        extractedItems = [
          { drugName: lantus.persianName, dosage: lantus.dosageStrength, count: 3, matchedMedicationId: lantus.id, price: lantus.officialPrice, isRare: lantus.isRare },
          { drugName: metform.persianName, dosage: metform.dosageStrength, count: 100, matchedMedicationId: metform.id, price: metform.officialPrice, isRare: metform.isRare },
        ];
      } else if (
        normalizedRaw.includes("سل‌سپت") || normalizedRaw.includes("سلسپت") || normalizedRaw.includes("پیوند") ||
        (trackingCode && String(trackingCode).startsWith("RX-5"))
      ) {
        const cellcept = pick((m: any) => m.brandName.includes("CellCept"));
        extractedItems = [
          { drugName: cellcept.persianName, dosage: cellcept.dosageStrength, count: 120, matchedMedicationId: cellcept.id, price: cellcept.officialPrice, isRare: true },
        ];
      } else if (normalizedRaw.includes("ریتالین") || normalizedRaw.includes("بیش فعالی")) {
        const ritalin = pick((m: any) => m.brandName.includes("Ritalin"));
        extractedItems = [
          { drugName: ritalin.persianName, dosage: ritalin.dosageStrength, count: 60, matchedMedicationId: ritalin.id, price: ritalin.officialPrice, isRare: true },
        ];
      } else {
        const s1 = allMeds[0] as any;
        const s2 = (allMeds[2] || allMeds[1]) as any;
        extractedItems = [
          { drugName: s1.persianName, dosage: s1.dosageStrength, count: 2, matchedMedicationId: s1.id, price: s1.officialPrice, isRare: s1.isRare },
          { drugName: s2.persianName, dosage: s2.dosageStrength, count: 1, matchedMedicationId: s2.id, price: s2.officialPrice, isRare: s2.isRare },
        ];
      }

      const scored = allPharmacies.map((p: any) => {
        const dist = calculateDistanceKm(userLat, userLng, Number(p.latitude), Number(p.longitude));
        const pInv = allInventory.filter((inv: any) => inv.pharmacyId === p.id);
        let availableItemsCount = 0;
        let totalBasketPrice = 0;
        for (const item of extractedItems) {
          const invItem = pInv.find((inv: any) => inv.medicationId === item.matchedMedicationId && inv.stockStatus !== "out_of_stock");
          if (invItem) {
            availableItemsCount += 1;
            totalBasketPrice += (invItem as any).price * item.count;
          } else {
            totalBasketPrice += item.price * item.count;
          }
        }
        return {
          pharmacy: (({ _id, __v, ...rest }: any) => rest)(p),
          distanceKm: dist,
          travelMinutes: estimateTravelMinutes(dist),
          availableItemsCount,
          totalItemsCount: extractedItems.length,
          hasAllItems: availableItemsCount === extractedItems.length,
          totalBasketPrice,
        };
      });

      scored.sort((a: any, b: any) => {
        if (a.hasAllItems && !b.hasAllItems) return -1;
        if (!a.hasAllItems && b.hasAllItems) return 1;
        return a.distanceKm - b.distanceKm;
      });

      return {
        success: true,
        scannedAt: new Date().toISOString(),
        doctorInfo: {
          doctorName: "دکتر مسعود افشار (متخصص داخلی و غدد)",
          medicalCouncilCode: "۴۴۲۱۰",
          clinic: "مرکز آموزشی درمانی بیمارستان امام خمینی",
        },
        patientInfo: {
          nationalId: nationalId || "0012345678",
          trackingCode: trackingCode || `RX-${Math.floor(10000 + Math.random() * 90000)}`,
          insurance: "سازمان بیمه سلامت ایرانیان / تامین اجتماعی",
        },
        extractedItems,
        recommendedPharmacies: scored.slice(0, 3),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
