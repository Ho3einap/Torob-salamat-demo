import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PharmacyInventory, Pharmacy, Medication } from "../database/models";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/inventory")
export class InventoryController {
  @Get()
  async list(@Query("pharmacyId") pharmacyId?: string, @Query("medicationId") medicationId?: string) {
    try {
      const filter: any = {};
      if (pharmacyId) filter.pharmacyId = Number(pharmacyId);
      else if (medicationId) filter.medicationId = Number(medicationId);

      const invs = await PharmacyInventory.find(filter).lean();
      const pharmaciesIds = Array.from(new Set(invs.map((i: any) => i.pharmacyId)));
      const medicationsIds = Array.from(new Set(invs.map((i: any) => i.medicationId)));

      const [pharmacies, medications] = await Promise.all([
        Pharmacy.find({ id: { $in: pharmaciesIds } }).lean(),
        Medication.find({ id: { $in: medicationsIds } }).lean(),
      ]);
      const phaById = new Map<number, any>();
      for (const p of pharmacies) phaById.set((p as any).id, p);
      const medById = new Map<number, any>();
      for (const m of medications) medById.set((m as any).id, m);

      const rows = invs.map((inv: any) => {
        const p = phaById.get(inv.pharmacyId);
        const m = medById.get(inv.medicationId);
        return {
          ...sanitize(inv),
          pharmacyName: p?.name,
          pharmacyCity: p?.city,
          pharmacyPhone: p?.phone,
          medicationName: m?.brandName,
          medicationPersian: m?.persianName,
          medicationStrength: m?.dosageStrength,
          isColdChain: m?.isColdChain,
        };
      });

      return { success: true, inventory: rows };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async upsert(@Body() body: Record<string, any>) {
    try {
      const { pharmacyId, medicationId, stockStatus, stockQuantity, price, discountPercent, batchExpiryDate, notes } = body || {};
      if (!pharmacyId || !medicationId || price === undefined) {
        return { success: false, error: "اطلاعات داروخانه و دارو الزامی است" };
      }

      const existing = await PharmacyInventory.findOne({
        pharmacyId: Number(pharmacyId),
        medicationId: Number(medicationId),
      });

      if (existing) {
        existing.stockStatus = stockStatus || "in_stock";
        existing.stockQuantity = Number(stockQuantity) || 0;
        existing.price = Number(price);
        existing.discountPercent = Number(discountPercent) || 0;
        existing.batchExpiryDate = batchExpiryDate || "2027-06";
        existing.notes = notes || "";
        (existing as any).lastVerifiedAt = new Date();
        await existing.save();
        return { success: true, inventory: sanitize((existing as any).toObject()), updated: true };
      }

      const created = await PharmacyInventory.create({
        pharmacyId: Number(pharmacyId),
        medicationId: Number(medicationId),
        stockStatus: stockStatus || "in_stock",
        stockQuantity: Number(stockQuantity) || 10,
        price: Number(price),
        discountPercent: Number(discountPercent) || 0,
        batchExpiryDate: batchExpiryDate || "2027-06",
        notes: notes || "",
      });
      return { success: true, inventory: sanitize((created as any).toObject()), created: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await PharmacyInventory.findOneAndUpdate(
        { id: Number(id) },
        {
          stockStatus: body.stockStatus,
          stockQuantity: Number(body.stockQuantity),
          price: Number(body.price),
          discountPercent: Number(body.discountPercent || 0),
          batchExpiryDate: body.batchExpiryDate,
          notes: body.notes,
          lastVerifiedAt: new Date(),
        },
        { new: true },
      ).lean();
      return { success: true, inventory: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await PharmacyInventory.deleteOne({ id: Number(id) });
      return { success: true, message: "موجودی حذف شد" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
