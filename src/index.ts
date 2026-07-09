/**
 * @nova/nestjs-observability
 *
 * Módulo dinámico NestJS de observabilidad con OpenTelemetry para el ecosistema Nova Platform.
 * Proporciona auto-instrumentación, trazas distribuidas, métricas,
 * correlación de logs vía Pino y exportación OTLP.
 */

// Módulo principal
export { ObservabilityModule } from './observability.module';

// Interfaces de configuración
export {
  ObservabilityModuleOptions,
  OtlpOptions,
  MetricsOptions,
  TracesOptions,
  LogsOptions,
  FilterOptions,
} from './interfaces/observability-module-options.interface';

export {
  ResolvedObservabilityOptions,
  ResolvedOtlpOptions,
  ResolvedMetricsOptions,
  ResolvedTracesOptions,
  ResolvedLogsOptions,
  ResolvedFilterOptions,
} from './interfaces/resolved-options.interface';

// Configuración
export { DEFAULT_OBSERVABILITY_OPTIONS } from './config/defaults';
export { resolveOptions } from './config/resolve-options';

// Constantes
export { OBSERVABILITY_OPTIONS } from './constants';

// Inicializador del SDK
export { OtelSdkInitializer } from './initializer/otel-sdk-initializer';

// Health check del Collector
export { CollectorHealthIndicator } from './health/collector-health-indicator';

// Logger Pino con correlación de trazas OpenTelemetry
export { createPinoLoggerOptions } from './logger/pino-logger.config';
