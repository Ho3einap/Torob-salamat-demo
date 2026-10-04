import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Pharmacy, PharmacyInventory, Medication, PharmacyReview } from "../database/models";
import { calculateDistanceKm, estimateTravelMinutes } from "../ai/ai.service";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/pharmacies")
export class PharmaciesController {
  @Get()
  async list(
    @Query("q") q?: string,
    @Query("city") city?: string,
    @Query("neighborhood") neighborhood?: string,
    @Query("is24hOnly") is24hOnly?: string,
    @Query("deliveryOnly") deliveryOnly?: string,
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
  ) {
    try {
      const userLat = lat ? parseFloat(lat) : 35.7575;
      const userLng = lng ? parseFloat(lng) : 51.4099;

      const filter: any = {};
      if (q) {
        const rx = new RegExp(q, "i");
        filter.$or = [
          { name: rx },
          { neighborhood: rx },
          { address: rx },
          { phone: rx },
          { pharmacistInCharge: rx },
        ];
      }
      if (city && city !== "all") filter.city = city;
      if (neighborhood && neighborhood !== "all") filter.neighborhood = neighborhood;
      if (is24hOnly === "true") filter.is24h = true;
      if (deliveryOnly === "true") filter.deliveryAvailable = true;

      const list = await Pharmacy.find(filter).lean();
      const withDistance = list.map((item: any) => {
        const clean = sanitize(item);
        const dist = calculateDistanceKm(userLat, userLng, Number(item.latitude), Number(item.longitude));
        return { ...clean, distanceKm: dist, travelMinutes: estimateTravelMinutes(dist) };
      });
      withDistance.sort((a: any, b: any) => a.distanceKm - b.distanceKm);
      return { success: true, count: withDistance.length, pharmacies: withDistance };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    try {
      const pId = Number(id);
      const pharmacy = await Pharmacy.findOne({ id: pId }).lean();
      if (!pharmacy) return { success: false, error: "داروخانه یافت نشد" };

      const [invs, reviews] = await Promise.all([
        PharmacyInventory.find({ pharmacyId: pId }).lean(),
        PharmacyReview.find({ pharmacyId: pId }).sort({ createdAt: -1 }).lean(),
      ]);

      const medIds = Array.from(new Set(invs.map((i: any) => i.medicationId)));
      const meds = await Medication.find({ id: { $in: medIds } }).lean();
      const medById = new Map<number, any>();
      for (const m of meds) medById.set((m as any).id, m);

      return {
        success: true,
        pharmacy: sanitize(pharmacy),
        inventory: invs.map((i: any) => ({ ...sanitize(i), medication: medById.get(i.medicationId) ? sanitize(medById.get(i.medicationId)) : null })),
        reviews: reviews.map(sanitize),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      if (!body?.name || !body?.phone || !body?.address) {
        return { success: false, error: "اطلاعات ضروری داروخانه را کامل کنید" };
      }

      const created = await Pharmacy.create({
        name: body.name,
        licenseNumber: body.licenseNumber || `IR-190-${Math.floor(10000 + Math.random() * 90000)}`,
        licenseType: body.licenseType || "شبانه‌روزی",
        city: body.city || "تهران",
        neighborhood: body.neighborhood || "مرکزی",
        address: body.address,
        phone: body.phone,
        mobile: body.mobile || undefined,
        whatsapp: body.whatsapp || undefined,
        latitude: Number(body.latitude ?? 35.7575),
        longitude: Number(body.longitude ?? 51.4099),
        is24h: Boolean(body.is24h),
        isVerified: true,
        deliveryAvailable: body.deliveryAvailable !== false,
        pharmacistInCharge: body.pharmacistInCharge || undefined,
        emergencyHotlineNote: body.emergencyHotlineNote || undefined,
        insuranceAccepted: Array.isArray(body.insuranceAccepted)
          ? body.insuranceAccepted
          : ["تامین اجتماعی", "بیمه سلامت"],
      });

      return { success: true, pharmacy: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await Pharmacy.findOneAndUpdate(
        { id: Number(id) },
        {
          name: body.name,
          licenseType: body.licenseType,
          city: body.city,
          neighborhood: body.neighborhood,
          address: body.address,
          phone: body.phone,
          mobile: body.mobile,
          whatsapp: body.whatsapp,
          is24h: Boolean(body.is24h),
          deliveryAvailable: Boolean(body.deliveryAvailable),
          pharmacistInCharge: body.pharmacistInCharge,
          emergencyHotlineNote: body.emergencyHotlineNote,
          insuranceAccepted: body.insuranceAccepted,
        },
        { new: true },
      ).lean();
      return { success: true, pharmacy: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await Pharmacy.deleteOne({ id: Number(id) });
      return { success: true, message: "داروخانه با موفقیت حذف گردید" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
