import { Controller, Get, Post } from "@nestjs/common";
import { Medication, Pharmacy, Reservation, RareDrugAlert, User } from "../database/models";
import { SeedService } from "./seed.service";

@Controller("api/bootstrap")
export class BootstrapController {
  constructor(private readonly seedService: SeedService) {}

  private async handle() {
    try {
      await this.seedService.seedDatabase();
      const [totalMedications, totalPharmacies, totalReservations, totalAlerts, users] =
        await Promise.all([
          Medication.countDocuments({}),
          Pharmacy.countDocuments({}),
          Reservation.countDocuments({}),
          RareDrugAlert.countDocuments({}),
          User.find({}).lean(),
        ]);
      return {
        success: true,
        stats: { totalMedications, totalPharmacies, totalReservations, totalAlerts },
        users: users.map(({ _id, __v, ...u }: any) => u),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Get()
  get() {
    return this.handle();
  }
  @Post()
  post() {
    return this.handle();
  }
}
