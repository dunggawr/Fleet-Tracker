import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM + Database will be added in Phase 02
    // AuthModule will be added in Phase 02
    // VehiclesModule will be added in Phase 03
    // DriversModule will be added in Phase 03
    // OrdersModule will be added in Phase 03
    // TripsModule will be added in Phase 04
    // DispatchModule will be added in Phase 04
    // TrackingModule will be added in Phase 05
    // AlertsModule will be added in Phase 05
    // ReportsModule will be added in Phase 06
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
