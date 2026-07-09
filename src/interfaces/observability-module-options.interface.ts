/**
 * Interfaces de configuración del módulo de observabilidad.
 * Todas las propiedades son opcionales — se aplican valores por defecto sensatos.
 */

/**
 * Opciones de configuración para la exportación OTLP al Collector.
 */
export interface OtlpOptions {
  /**
   * URL base del OpenTelemetry Collector.
   * Alternativa: variable de entorno OTEL_EXPORTER_OTLP_ENDPOINT.
   * @default 'http://localhost:4318'
   */
  endpoint?: string;

  /**
   * Protocolo de exportación OTLP.
   * @default 'http/protobuf'
   */
  protocol?: 'http/protobuf' | 'http/json';

  /**
   * Timeout de exportación en milisegundos.
   * @default 10000
   */
  timeout?: number;

  /**
   * Headers adicionales para las peticiones al Collector.
   * Útil para autenticación en ambientes cloud.
   * @default {}
   */
  headers?: Record<string, string>;
}

/**
 * Opciones de configuración para métricas.
 */
export interface MetricsOptions {
  /**
   * Activa o desactiva la exportación de métricas.
   * @default true
   */
  enabled?: boolean;

  /**
   * Activa o desactiva el registro automático de Four Golden Signals.
   * @default true
   */
  goldenSignals?: boolean;

  /**
   * Intervalo de exportación de métricas en milisegundos.
   * Configura el PeriodicExportingMetricReader.
   * @default 5000
   */
  exportIntervalMs?: number;

  /**
   * Prefijo para los nombres de métricas Golden Signals.
   * @default 'golden_signals'
   */
  prefix?: string;
}

/**
 * Opciones de configuración para trazas distribuidas.
 */
export interface TracesOptions {
  /**
   * Activa o desactiva la generación de trazas.
   * @default true
   */
  enabled?: boolean;

  /**
   * Ratio de sampling (0.0 a 1.0).
   * 1.0 = todas las trazas, 0.5 = 50% de las trazas.
   * @default 1.0
   */
  samplingRatio?: number;
}

/**
 * Opciones de configuración para logs correlacionados.
 */
export interface LogsOptions {
  /**
   * Activa o desactiva la correlación de logs con trazas.
   * @default true
   */
  enabled?: boolean;

  /**
   * Exporta logs al Collector vía OTLP usando BatchLogRecordProcessor.
   * Si es false, los logs solo se emiten a stdout con correlación.
   * @default true
   */
  exportToOtlp?: boolean;
}

/**
 * Opciones de filtrado para el interceptor de métricas.
 */
export interface FilterOptions {
  /**
   * Rutas excluidas del registro de métricas.
   * Soporta patrones glob simples.
   * @default ['/health', '/health/*', '/swagger', '/swagger/*']
   */
  excludePaths?: string[];

  /**
   * Normaliza URIs usando los path patterns de los controladores NestJS.
   * Reduce la cardinalidad de métricas sustituyendo valores dinámicos.
   * @default true
   */
  normalizeIds?: boolean;
}

/**
 * Opciones de configuración del módulo de observabilidad.
 * Todas las propiedades son opcionales — se aplican valores por defecto sensatos.
 */
export interface ObservabilityModuleOptions {
  /**
   * Activa o desactiva completamente el módulo.
   * Si es false, no se inicializa el SDK ni se registran providers.
   * @default true
   */
  enabled?: boolean;

  /**
   * Nombre del servicio para el resource de OpenTelemetry.
   * Se usa como atributo `service.name` en toda la telemetría.
   * Alternativa: variable de entorno OTEL_SERVICE_NAME.
   * @default 'unknown-service'
   */
  serviceName?: string;

  /**
   * Namespace del servicio (equipo, dominio).
   * Se usa como atributo `service.namespace`.
   * Alternativa: variable de entorno OTEL_SERVICE_NAMESPACE.
   * @default 'default'
   */
  serviceNamespace?: string;

  /**
   * Ambiente de ejecución (dev, staging, production).
   * Se usa como atributo `deployment.environment`.
   * @default 'dev'
   */
  environment?: string;

  /** Configuración de exportación OTLP */
  otlp?: OtlpOptions;

  /** Configuración de métricas */
  metrics?: MetricsOptions;

  /** Configuración de trazas */
  traces?: TracesOptions;

  /** Configuración de logs */
  logs?: LogsOptions;

  /** Configuración de filtrado de rutas */
  filter?: FilterOptions;
}
