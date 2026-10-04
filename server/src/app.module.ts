import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health.controller";
import { SeedService } from "./seed/seed.service";
import { BootstrapController } from "./seed/bootstrap.controller";
import { AiService } from "./ai/ai.service";
import { ChatController } from "./chat/chat.controller";
import { MeController, AuthSwitchController } from "./auth/auth.controller";
import { MedicationsController, ManufacturersController } from "./catalog/catalog.controller";
import { PharmaciesController } from "./pharmacies/pharmacies.controller";
import { InventoryController } from "./inventory/inventory.controller";
import { PrescriptionsController, PrescriptionsScanController } from "./prescriptions/prescriptions.controller";
import { ReservationsController } from "./reservations/reservations.controller";
import { AlertsController } from "./alerts/alerts.controller";
import { ReviewsController } from "./reviews/reviews.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [
    HealthController,
    BootstrapController,
    MeController,
    AuthSwitchController,
    ChatController,
    MedicationsController,
    ManufacturersController,
    PharmaciesController,
    InventoryController,
    PrescriptionsController,
    PrescriptionsScanController,
    ReservationsController,
    AlertsController,
    ReviewsController,
  ],
  providers: [SeedService, AiService],
})
export class AppModule {}
