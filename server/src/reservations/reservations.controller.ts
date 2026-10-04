import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Reservation, Pharmacy, Medication, User } from "../database/models";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/reservations")
export class ReservationsController {
  @Get()
  async list(@Query("userId") userId?: string, @Query("pharmacyId") pharmacyId?: string) {
    try {
      const filter: any = {};
      if (userId) filter.userId = Number(userId);
      else if (pharmacyId) filter.pharmacyId = Number(pharmacyId);

      const list = await Reservation.find(filter).sort({ createdAt: -1 }).lean();
      const pharmacyIds = Array.from(new Set(list.map((r: any) => r.pharmacyId).filter(Boolean)));
      const medicationIds = Array.from(new Set(list.map((r: any) => r.medicationId).filter(Boolean)));
      const userIds = Array.from(new Set(list.map((r: any) => r.userId).filter(Boolean)));

      const [pharmacies, medications, users] = await Promise.all([
        Pharmacy.find({ id: { $in: pharmacyIds } }).lean(),
        Medication.find({ id: { $in: medicationIds } }).lean(),
        User.find({ id: { $in: userIds } }).lean(),
      ]);
      const phaById = new Map<number, any>();
      for (const p of pharmacies) phaById.set((p as any).id, p);
      const medById = new Map<number, any>();
      for (const m of medications) medById.set((m as any).id, m);
      const userById = new Map<number, any>();
      for (const u of users) userById.set((u as any).id, u);

      return {
        success: true,
        count: list.length,
        reservations: list.map((r: any) => ({
          reservation: sanitize(r),
          pharmacy: phaById.get(r.pharmacyId) ? sanitize(phaById.get(r.pharmacyId)) : null,
          medication: medById.get(r.medicationId) ? sanitize(medById.get(r.medicationId)) : null,
          user: userById.get(r.userId) ? sanitize(userById.get(r.userId)) : null,
        })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    try {
      const r = await Reservation.findOne({ id: Number(id) }).lean();
      if (!r) return { success: false, error: "رزرو دارو یافت نشد" };
      return { success: true, reservation: sanitize(r) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      const { userId, pharmacyId, medicationId, prescriptionId, quantity, unitPrice, deliveryType, userPhone, userAddress, patientNotes } = body || {};
      if (!pharmacyId || !unitPrice || !userPhone) {
        return { success: false, error: "اطلاعات داروخانه، قیمت و تلفن تماس الزامی است" };
      }
      const qty = Number(quantity) || 1;
      const price = Number(unitPrice);
      const created = await Reservation.create({
        userId: userId ? Number(userId) : undefined,
        pharmacyId: Number(pharmacyId),
        medicationId: medicationId ? Number(medicationId) : undefined,
        prescriptionId: prescriptionId ? Number(prescriptionId) : undefined,
        quantity: qty,
        unitPrice: price,
        totalPrice: qty * price,
        status: "pending_review",
        deliveryType: deliveryType || "pickup",
        userPhone,
        userAddress: userAddress || "",
        patientNotes: patientNotes || "",
        reservedUntil: new Date(Date.now() + 3 * 3600 * 1000),
      });
      return { success: true, reservation: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await Reservation.findOneAndUpdate(
        { id: Number(id) },
        {
          status: body.status,
          pharmacistNotes: body.pharmacistNotes,
          deliveryType: body.deliveryType,
          userAddress: body.userAddress,
        },
        { new: true },
      ).lean();
      return { success: true, reservation: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await Reservation.deleteOne({ id: Number(id) });
      return { success: true, message: "رزرو لغو و حذف شد" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
