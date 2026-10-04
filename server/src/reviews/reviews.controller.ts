import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { PharmacyReview, Pharmacy } from "../database/models";

function sanitize(o: any) {
  if (!o) return o;
  const { _id, __v, ...rest } = o;
  return rest;
}

@Controller("api/reviews")
export class ReviewsController {
  @Get()
  async list(@Query("pharmacyId") pharmacyId?: string) {
    try {
      const filter: any = {};
      if (pharmacyId) filter.pharmacyId = Number(pharmacyId);
      const reviews = await PharmacyReview.find(filter).sort({ createdAt: -1 }).lean();
      const phaIds = Array.from(new Set(reviews.map((r: any) => r.pharmacyId)));
      const pharmacies = await Pharmacy.find({ id: { $in: phaIds } }).lean();
      const phaById = new Map<number, any>();
      for (const p of pharmacies) phaById.set((p as any).id, p);
      return {
        success: true,
        reviews: reviews.map((r: any) => ({
          review: sanitize(r),
          pharmacyName: phaById.get(r.pharmacyId)?.name || null,
        })),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    try {
      const { pharmacyId, userId, userName, rating, stockAccuracyScore, pharmacistServiceScore, comment } = body || {};
      if (!pharmacyId || !userName || !comment) {
        return { success: false, error: "اطلاعات نظر و امتیاز الزامی است" };
      }

      const created = await PharmacyReview.create({
        pharmacyId: Number(pharmacyId),
        userId: userId ? Number(userId) : undefined,
        userName,
        rating: Number(rating) || 5,
        stockAccuracyScore: Number(stockAccuracyScore) || 5,
        pharmacistServiceScore: Number(pharmacistServiceScore) || 5,
        comment,
      });

      const pId = Number(pharmacyId);
      const allPReviews = await PharmacyReview.find({ pharmacyId: pId }).lean();
      if (allPReviews.length > 0) {
        const avg = Number(
          (allPReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / allPReviews.length).toFixed(1),
        );
        await Pharmacy.updateOne({ id: pId }, { rating: avg, totalReviews: allPReviews.length });
      }

      return { success: true, review: sanitize((created as any).toObject()) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
