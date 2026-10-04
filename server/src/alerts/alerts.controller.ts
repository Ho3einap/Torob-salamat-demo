import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { RareDrugAlert, Medication, User } from "../database/models";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/alerts")
export class AlertsController {
  @Get()
  async list(@Query("userId") userId?: string) {
    try {
      const filter: any = {};
      if (userId) filter.userId = Number(userId);
      const list = await RareDrugAlert.find(filter).sort({ createdAt: -1 }).lean();

      const medIds = Array.from(new Set(list.map((a: any) => a.medicationId).filter(Boolean)));
      const userIds = Array.from(new Set(list.map((a: any) => a.userId).filter(Boolean)));
      const [meds, users] = await Promise.all([
        Medication.find({ id: { $in: medIds } }).lean(),
        User.find({ id: { $in: userIds } }).lean(),
      ]);
      const medById = new Map<number, any>();
      for (const m of meds) medById.set((m as any).id, m);
      const userById = new Map<number, any>();
      for (const u of users) userById.set((u as any).id, u);

      return {
        success: true,
        count: list.length,
        alerts: list.map((a: any) => ({
          alert: sanitize(a),
          medication: medById.get(a.medicationId) ? sanitize(medById.get(a.medicationId)) : null,
          user: userById.get(a.userId) ? sanitize(userById.get(a.userId)) : null,
        })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      const { userId, medicationId, city, maxDistanceKm, userPhone, notes } = body || {};
      if (!medicationId || !userPhone) {
        return { success: false, error: "شناسه دارو و شماره تماس الزامی است" };
      }
      const created = await RareDrugAlert.create({
        userId: userId ? Number(userId) : undefined,
        medicationId: Number(medicationId),
        city: city || "تهران",
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : 25,
        userPhone,
        isActive: true,
        notifiedCount: 0,
        notes: notes || "",
      });
      return { success: true, alert: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, any>) {
    try {
      const updated = await RareDrugAlert.findOneAndUpdate(
        { id: Number(id) },
        {
          isActive: body.isActive,
          maxDistanceKm: body.maxDistanceKm ? Number(body.maxDistanceKm) : undefined,
          userPhone: body.userPhone,
          notes: body.notes,
        },
        { new: true },
      ).lean();
      return { success: true, alert: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      await RareDrugAlert.deleteOne({ id: Number(id) });
      return { success: true, message: "گوش به زنگ با موفقیت حذف شد" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
