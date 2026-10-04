import { Controller, Get, Inject } from "@nestjs/common";
import mongoose from "mongoose";
import { DB_TOKEN, DatabaseHandle } from "./database/database.module";

@Controller("api/health")
export class HealthController {
  constructor(@Inject(DB_TOKEN) private readonly db: DatabaseHandle) {}

  @Get()
  check() {
    const state = mongoose.connection.readyState; // 1 = connected
    return {
      status: state === 1 ? "ok" : "degraded",
      service: "torob-salamat-nestjs",
      stack: "NestJS + Vue 3 + Mongoose + MongoDB",
      mongoState: state,
      timestamp: new Date().toISOString(),
    };
  }
}
