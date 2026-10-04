import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Serve the built Vue 3 client (SPA) from dist/client
  const clientDist = join(__dirname, "..", "client");
  app.useStaticAssets(clientDist);
  app.use((req: any, res: any, next: () => void) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(join(clientDist, "index.html"));
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`🏥 Torob Salamat (NestJS API + Vue 3 client) ready on http://0.0.0.0:${port}`);
}

void bootstrap();
