// ===== Fleet Management System Constants =====

export const CONFIG = {
  // GPS
  GPS_UPDATE_INTERVAL_MS: 5000,
  GPS_BATCH_INSERT_INTERVAL: 5000,

  // Alerts thresholds
  MAX_SPEED_KMH: 80,
  ROUTE_DEVIATION_METERS: 500,
  IDLE_TIMEOUT_MINUTES: 10,
  SPEED_VIOLATION_TOLERANCE_SEC: 3,

  // KPI penalties
  KPI_PENALTY_SPEED: 5,
  KPI_PENALTY_ROUTE: 8,
  KPI_PENALTY_IDLE: 3,
  KPI_PENALTY_INCIDENT: 10,
  KPI_MAX_SCORE: 100,

  // Fuel rates (L/100km)
  FUEL_RATE: {
    small: 8,
    medium: 12,
    large: 16,
  },
  FUEL_PRICE_VND: 25000,

  // Dispatch
  DISPATCH_SUGGEST_LIMIT: 5,
  CLUSTER_RADIUS_METERS: 3000,

  // Auth
  JWT_ACCESS_EXPIRY: '1h',
  JWT_REFRESH_EXPIRY: '7d',

  // Upload
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Enums matching database
export enum UserRole {
  ADMIN = 'admin',
  DRIVER = 'driver',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_TRIP = 'on_trip',
  OFF_DUTY = 'off_duty',
}

export enum VehicleType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  DELIVERING = 'delivering',
  MAINTENANCE = 'maintenance',
}

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum TripStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AlertType {
  SPEED_VIOLATION = 'speed_violation',
  ROUTE_DEVIATION = 'route_deviation',
  ABNORMAL_STOP = 'abnormal_stop',
  INCIDENT = 'incident',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
