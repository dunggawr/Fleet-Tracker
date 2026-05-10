import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778427114680 implements MigrationInterface {
    name = 'InitialSchema1778427114680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'driver', 'dispatcher')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'driver', "refresh_token_hash" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."drivers_status_enum" AS ENUM('available', 'on_trip', 'off_duty')`);
        await queryRunner.query(`CREATE TABLE "drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "full_name" character varying NOT NULL, "phone" character varying NOT NULL, "license_class" character varying, "license_expiry" date, "status" "public"."drivers_status_enum" NOT NULL DEFAULT 'off_duty', "avatar_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_8e224f1b8f05ace7cfc7c76d03" UNIQUE ("user_id"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_type_enum" AS ENUM('small', 'medium', 'large')`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_status_enum" AS ENUM('available', 'delivering', 'maintenance')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plate_number" character varying NOT NULL, "type" "public"."vehicles_type_enum" NOT NULL, "max_capacity_kg" numeric NOT NULL, "current_load_kg" numeric NOT NULL DEFAULT '0', "driver_id" uuid, "status" "public"."vehicles_status_enum" NOT NULL DEFAULT 'available', "image_url" character varying, "last_known_location" geography(Point,4326), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a7eeeb4b551b2629dd9ee964134" UNIQUE ("plate_number"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'assigned', 'picked_up', 'delivering', 'delivered', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickup_address" character varying NOT NULL, "pickup_location" geography(Point,4326) NOT NULL, "delivery_address" character varying NOT NULL, "delivery_location" geography(Point,4326) NOT NULL, "weight_kg" numeric NOT NULL, "description" text, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "photo_url" text, "signature_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `);
        await queryRunner.query(`CREATE TABLE "trip_orders" ("trip_id" uuid NOT NULL, "order_id" uuid NOT NULL, "sequence" integer NOT NULL, CONSTRAINT "PK_f32e9c62c19ffa064a33272b981" PRIMARY KEY ("trip_id", "order_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."trips_status_enum" AS ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "trips" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "planned_route" geography(LineString,4326), "actual_route" geography(LineString,4326), "status" "public"."trips_status_enum" NOT NULL DEFAULT 'pending', "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "total_distance_km" numeric, "estimated_fuel_cost" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f71c231dee9c05a9522f9e840f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gps_locations" ("id" BIGSERIAL NOT NULL, "vehicle_id" uuid NOT NULL, "trip_id" uuid, "location" geography(Point,4326) NOT NULL, "speed_kmh" numeric, "heading" numeric, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_1395375cf4a8d3d08d682e7dff7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3ed605b32552f6f03cdc154153" ON "gps_locations" ("vehicle_id", "recorded_at") `);
        await queryRunner.query(`CREATE TYPE "public"."alerts_type_enum" AS ENUM('speed_violation', 'route_deviation', 'abnormal_stop', 'incident')`);
        await queryRunner.query(`CREATE TYPE "public"."alerts_severity_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid, "vehicle_id" uuid NOT NULL, "driver_id" uuid, "type" "public"."alerts_type_enum" NOT NULL, "severity" "public"."alerts_severity_enum" NOT NULL, "message" text NOT NULL, "location" geography(Point,4326), "is_resolved" boolean NOT NULL DEFAULT false, "resolved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "driver_kpi" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_id" uuid NOT NULL, "total_trips" integer NOT NULL DEFAULT '0', "completed_trips" integer NOT NULL DEFAULT '0', "completion_rate" numeric NOT NULL DEFAULT '0', "total_violations" integer NOT NULL DEFAULT '0', "speed_violations" integer NOT NULL DEFAULT '0', "route_violations" integer NOT NULL DEFAULT '0', "kpi_score" numeric NOT NULL DEFAULT '100', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8122b6c9ed335bccb4efd0c4c3e" UNIQUE ("driver_id"), CONSTRAINT "REL_8122b6c9ed335bccb4efd0c4c3" UNIQUE ("driver_id"), CONSTRAINT "PK_d188626ccbfce258945b9ed0b6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_9c2e0a8772c9e43b32f57bfcfcc" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trip_orders" ADD CONSTRAINT "FK_49dcfadcd6516ce31866f31eacf" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trip_orders" ADD CONSTRAINT "FK_eb3ae7e919ef2a41341d99b13d6" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_ab4b806373c2ee43946679d572e" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_44d36110fb38f45c2f15c946ddb" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gps_locations" ADD CONSTRAINT "FK_a6fd64c4d252272725d9716af40" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gps_locations" ADD CONSTRAINT "FK_ef70b89fb4eb8f22d5e6adbdd08" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_e9e6791b945e74a123fc1316381" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_74dd85f46da0c401a52b82aa8f5" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alerts" ADD CONSTRAINT "FK_6e903097eae826928bc6030b5c5" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver_kpi" ADD CONSTRAINT "FK_8122b6c9ed335bccb4efd0c4c3e" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver_kpi" DROP CONSTRAINT "FK_8122b6c9ed335bccb4efd0c4c3e"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_6e903097eae826928bc6030b5c5"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_74dd85f46da0c401a52b82aa8f5"`);
        await queryRunner.query(`ALTER TABLE "alerts" DROP CONSTRAINT "FK_e9e6791b945e74a123fc1316381"`);
        await queryRunner.query(`ALTER TABLE "gps_locations" DROP CONSTRAINT "FK_ef70b89fb4eb8f22d5e6adbdd08"`);
        await queryRunner.query(`ALTER TABLE "gps_locations" DROP CONSTRAINT "FK_a6fd64c4d252272725d9716af40"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_44d36110fb38f45c2f15c946ddb"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_ab4b806373c2ee43946679d572e"`);
        await queryRunner.query(`ALTER TABLE "trip_orders" DROP CONSTRAINT "FK_eb3ae7e919ef2a41341d99b13d6"`);
        await queryRunner.query(`ALTER TABLE "trip_orders" DROP CONSTRAINT "FK_49dcfadcd6516ce31866f31eacf"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_9c2e0a8772c9e43b32f57bfcfcc"`);
        await queryRunner.query(`ALTER TABLE "drivers" DROP CONSTRAINT "FK_8e224f1b8f05ace7cfc7c76d03b"`);
        await queryRunner.query(`DROP TABLE "driver_kpi"`);
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_severity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."alerts_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3ed605b32552f6f03cdc154153"`);
        await queryRunner.query(`DROP TABLE "gps_locations"`);
        await queryRunner.query(`DROP TABLE "trips"`);
        await queryRunner.query(`DROP TYPE "public"."trips_status_enum"`);
        await queryRunner.query(`DROP TABLE "trip_orders"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_type_enum"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TYPE "public"."drivers_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
