/**
 * Valores por defecto para la configuración del módulo de observabilidad.
 * Se aplican cuando el usuario no proporciona opciones explícitas.
 */

import { ResolvedObservabilityOptions } from '../interfaces/resolved-options.interface';

/**
 * Configuración por defecto del módulo de observabilidad.
 * Proporciona valores funcionales para desarrollo local sin configuración adicional.
 */
export const DEFAULT_OBSERVABILITY_OPTIONS: ResolvedObservabilityOptions = {
  enabled: true,
  serviceName: 'unknown-service',
  serviceNamespace: 'default',
  environment: 'dev',
  otlp: {
    endpoint: 'http://localhost:4318',
    protocol: 'http/protobuf',
    timeout: 10000,
    headers: {},
  },
  metrics: {
    enabled: true,
    goldenSignals: true,
    exportIntervalMs: 5000,
    prefix: 'golden_signals',
  },
  traces: {
    enabled: true,
    samplingRatio: 1.0,
  },
  logs: {
    enabled: true,
    exportToOtlp: true,
  },
  filter: {
    excludePaths: ['/health', '/health/*', '/swagger', '/swagger/*'],
    normalizeIds: true,
  },
};
