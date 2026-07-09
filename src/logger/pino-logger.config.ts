/**
 * Configuración de Pino como logger con correlación automática de trazas OpenTelemetry.
 * Usa pino-opentelemetry-transport para exportar logs vía OTLP al Collector
 * y automáticamente inyecta traceId/spanId en cada log.
 */

import { ResolvedObservabilityOptions } from '../interfaces/resolved-options.interface';

/**
 * Crea la configuración de Pino con transporte OpenTelemetry.
 * Los logs se emiten en formato JSON estructurado con correlación de trazas.
 *
 * @param options - Opciones resueltas del módulo de observabilidad
 * @returns Configuración de Pino lista para usar con LoggerModule o como logger de NestJS
 */
export function createPinoLoggerOptions(options: ResolvedObservabilityOptions) {
  const transports: any[] = [
    // Transporte a stdout (siempre activo)
    {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
    },
  ];

  // Transporte OTLP (si logs.exportToOtlp está habilitado)
  if (options.logs.enabled && options.logs.exportToOtlp) {
    transports.push({
      target: 'pino-opentelemetry-transport',
      options: {
        resourceAttributes: {
          'service.name': options.serviceName,
          'service.namespace': options.serviceNamespace,
          'deployment.environment': options.environment,
        },
      },
    });
  }

  return {
    level: 'info',
    transport: {
      targets: transports,
    },
    // Pino automáticamente incluye traceId/spanId cuando OTel está activo
    // gracias a pino-opentelemetry-transport
  };
}
