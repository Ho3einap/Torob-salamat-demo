import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Medication, Manufacturer, PharmacyInventory, Pharmacy } from "../database/models";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/medications")
export class MedicationsController {
  @Get()
  async list(
    @Query("q") q?: string,
    @Query("category") category?: string,
    @Query("rareOnly") rareOnly?: string,
    @Query("coldChainOnly") coldChainOnly?: string,
    @Query("sortBy") sortBy?: string,
  ) {
    try {
      const filter: any = {};
      if (q) {
        const rx = new RegExp(q, "i");
        filter.$or = [
          { brandName: rx },
          { persianName: rx },
          { genericName: rx },
          { usageSummary: rx },
        ];
      }
      if (category && category !== "all") filter.category = category;
      if (rareOnly === "true") filter.isRare = true;
      if (coldChainOnly === "true") filter.isColdChain = true;

      const [meds, mans] = await Promise.all([
        Medication.find(filter).lean(),
        Manufacturer.find({}).lean(),
      ]);
      const manById = new Map<number, any>();
      for (const m of mans) manById.set((m as any).id, m);

      const results = meds.map((m: any) => ({
        ...sanitize(m),
        manufacturer: manById.get(m.manufacturerId) ? sanitize(manById.get(m.manufacturerId)) : null,
      }));

      results.sort((a: any, b: any) => {
        if (sortBy === "price_asc") return a.officialPrice - b.officialPrice;
        if (sortBy === "price_desc") return b.officialPrice - a.officialPrice;
        if (sortBy === "name") return a.persianName.localeCompare(b.persianName, "fa");
        return (b.manufacturer?.qualityScore ?? 80) - (a.manufacturer?.qualityScore ?? 80);
      });

      return { success: true, count: results.length, medications: results };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    try {
      const medId = Number(id);
      const med = await Medication.findOne({ id: medId }).lean();
      if (!med) return { success: false, error: "دارو یافت نشد" };

      const [manufacturer, invs, alts] = await Promise.all([
        Manufacturer.findOne({ id: (med as any).manufacturerId }).lean(),
        PharmacyInventory.find({ medicationId: medId }).lean(),
        Medication.find({ genericName: (med as any).genericName }).lean(),
      ]);
      const mans = await Manufacturer.find({}).lean();
      const manById = new Map<number, any>();
      for (const m of mans) manById.set((m as any).id, m);

      const pharmacyIds = Array.from(new Set(invs.map((i: any) => i.pharmacyId)));
      const pharmacies = await Pharmacy.find({ id: { $in: pharmacyIds } }).lean();
      const phaById = new Map<number, any>();
      for (const p of pharmacies) phaById.set((p as any).id, p);

      const pharmaciesStock = invs.map((inv: any) => ({
        inventoryId: inv.id,
        stockStatus: inv.stockStatus,
        stockQuantity: inv.stockQuantity,
        price: inv.price,
        discountPercent: inv.discountPercent,
        lastVerifiedAt: inv.lastVerifiedAt,
        notes: inv.notes,
        pharmacy: sanitize(phaById.get(inv.pharmacyId)),
      }));

      return {
        success: true,
        medication: { ...sanitize(med), manufacturer: manufacturer ? sanitize(manufacturer) : null },
        pharmaciesStock,
        alternatives: alts
          .filter((a: any) => a.id !== medId)
          .map((a: any) => ({ ...sanitize(a), manufacturer: manById.get(a.manufacturerId) ? sanitize(manById.get(a.manufacturerId)) : null })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      if (!body?.persianName || !body?.brandName || !body?.dosageStrength || body?.officialPrice === undefined) {
        return { success: false, error: "فیلدهای ضروری را پر کنید" };
      }
      const created = await Medication.create({
        genericName: body.genericName || body.brandName,
        persianName: body.persianName,
        brandName: body.brandName,
        category: body.category || "داروهای عمومی",
        isRare: Boolean(body.isRare),
        isColdChain: Boolean(body.isColdChain),
        requiresPrescription: body.requiresPrescription !== false,
        dosageForm: body.dosageForm || "قرص",
        dosageStrength: body.dosageStrength,
        manufacturerId: body.manufacturerId ? Number(body.manufacturerId) : undefined,
        officialPrice: Number(body.officialPrice),
        usageSummary: body.usageSummary || "اطلاعات مصرف دارویی ثبت شده در سامانه ترب سلامت",
        sideEffects: body.sideEffects || "طبق دستور پزشک مصرف شود",
        storageCondition: body.storageCondition || "دمای اتاق",
        ifdaStatus: body.ifdaStatus || "دارای مجوز سازمان غذا و دارو",
        tags: Array.isArray(body.tags) ? body.tags : [body.brandName, body.persianName],
      });

      const allPharmacies = await Pharmacy.find({}).lean();
      if (allPharmacies.length > 0) {
        await PharmacyInventory.insertMany(
          allPharmacies.map((p: any) => ({
            pharmacyId: p.id,
            medicationId: (created as any).id,
            stockStatus: "in_stock",
            stockQuantity: 10,
            price: Number(body.officialPrice),
            discountPercent: 0,
            batchExpiryDate: "2027-12",
          })),
        );
      }

      return { success: true, medication: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await Medication.findOneAndUpdate(
        { id: Number(id) },
        {
          genericName: body.genericName,
          persianName: body.persianName,
          brandName: body.brandName,
          category: body.category,
          isRare: Boolean(body.isRare),
          isColdChain: Boolean(body.isColdChain),
          requiresPrescription: Boolean(body.requiresPrescription),
          dosageForm: body.dosageForm,
          dosageStrength: body.dosageStrength,
          manufacturerId: body.manufacturerId ? Number(body.manufacturerId) : undefined,
          officialPrice: Number(body.officialPrice),
          usageSummary: body.usageSummary,
          sideEffects: body.sideEffects,
          storageCondition: body.storageCondition,
          ifdaStatus: body.ifdaStatus,
        },
        { new: true },
      ).lean();
      return { success: true, medication: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await Medication.deleteOne({ id: Number(id) });
      return { success: true, message: "دارو با موفقیت حذف شد" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

@Controller("api/manufacturers")
export class ManufacturersController {
  @Get()
  async list() {
    try {
      const list = await Manufacturer.find({}).sort({ qualityScore: -1 }).lean();
      return { success: true, manufacturers: list.map(sanitize) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      const created = await Manufacturer.create({
        name: body.name,
        persianName: body.persianName,
        country: body.country,
        qualityTier: body.qualityTier || "A",
        qualityScore: body.qualityScore ? Number(body.qualityScore) : 85,
        reputationNotes: body.reputationNotes || undefined,
        isIranian: Boolean(body.isIranian),
        website: body.website || undefined,
      });
      return { success: true, manufacturer: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
