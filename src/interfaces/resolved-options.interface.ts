/**
 * Interfaces de configuración resuelta (todos los campos obligatorios).
 * Representan el estado final de la configuración después de aplicar defaults y variables de entorno.
 */

/**
 * Opciones OTLP resueltas — todos los campos son obligatorios.
 */
export interface ResolvedOtlpOptions {
  /** URL base del OpenTelemetry Collector */
  endpoint: string;

  /** Protocolo de exportación OTLP */
  protocol: 'http/protobuf' | 'http/json';

  /** Timeout de exportación en milisegundos */
  timeout: number;

  /** Headers adicionales para las peticiones al Collector */
  headers: Record<string, string>;
}

/**
 * Opciones de métricas resueltas — todos los campos son obligatorios.
 */
export interface ResolvedMetricsOptions {
  /** Indica si la exportación de métricas está activa */
  enabled: boolean;

  /** Indica si el registro automático de Four Golden Signals está activo */
  goldenSignals: boolean;

  /** Intervalo de exportación de métricas en milisegundos */
  exportIntervalMs: number;

  /** Prefijo para los nombres de métricas Golden Signals */
  prefix: string;
}

/**
 * Opciones de trazas resueltas — todos los campos son obligatorios.
 */
export interface ResolvedTracesOptions {
  /** Indica si la generación de trazas está activa */
  enabled: boolean;

  /** Ratio de sampling (0.0 a 1.0) */
  samplingRatio: number;
}

/**
 * Opciones de logs resueltas — todos los campos son obligatorios.
 */
export interface ResolvedLogsOptions {
  /** Indica si la correlación de logs está activa */
  enabled: boolean;

  /** Indica si los logs se exportan al Collector vía OTLP */
  exportToOtlp: boolean;
}

/**
 * Opciones de filtrado resueltas — todos los campos son obligatorios.
 */
export interface ResolvedFilterOptions {
  /** Rutas excluidas del registro de métricas */
  excludePaths: string[];

  /** Indica si se normalizan las URIs con path patterns */
  normalizeIds: boolean;
}

/**
 * Configuración completa resuelta del módulo de observabilidad.
 * Todos los campos son obligatorios — resultado de aplicar defaults sobre las opciones parciales.
 */
export interface ResolvedObservabilityOptions {
  /** Indica si el módulo está activo */
  enabled: boolean;

  /** Nombre del servicio para el resource de OpenTelemetry */
  serviceName: string;

  /** Namespace del servicio */
  serviceNamespace: string;

  /** Ambiente de ejecución */
  environment: string;

  /** Configuración de exportación OTLP */
  otlp: ResolvedOtlpOptions;

  /** Configuración de métricas */
  metrics: ResolvedMetricsOptions;

  /** Configuración de trazas */
  traces: ResolvedTracesOptions;

  /** Configuración de logs */
  logs: ResolvedLogsOptions;

  /** Configuración de filtrado de rutas */
  filter: ResolvedFilterOptions;
}
