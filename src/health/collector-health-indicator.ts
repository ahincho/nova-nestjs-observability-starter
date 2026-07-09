/**
 * Indicador de salud que verifica la conectividad con el OpenTelemetry Collector.
 * Compatible con @nestjs/terminus usando HealthIndicatorService (API actual).
 */

import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { OBSERVABILITY_OPTIONS } from '../constants';
import { ResolvedObservabilityOptions } from '../interfaces/resolved-options.interface';

/** Timeout por defecto para el health check del Collector (3 segundos) */
const HEALTH_CHECK_TIMEOUT_MS = 3000;

/**
 * Indicador de salud que verifica la conectividad con el OpenTelemetry Collector.
 * Realiza un HTTP GET al endpoint configurado para verificar que el Collector
 * está accesible y respondiendo.
 *
 * Uso con @nestjs/terminus:
 * ```typescript
 * @Controller('health')
 * export class HealthController {
 *   constructor(
 *     private health: HealthCheckService,
 *     private collector: CollectorHealthIndicator,
 *   ) {}
 *
 *   @Get()
 *   check() {
 *     return this.health.check([
 *       () => this.collector.isHealthy('otel-collector'),
 *     ]);
 *   }
 * }
 * ```
 */
@Injectable()
export class CollectorHealthIndicator {
  /** Endpoint del Collector para verificar conectividad */
  private readonly endpoint: string;

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(OBSERVABILITY_OPTIONS)
    options: ResolvedObservabilityOptions,
  ) {
    this.endpoint = options.otlp.endpoint;
  }

  /**
   * Verifica la conectividad con el Collector realizando un HTTP GET al endpoint.
   * Usa un timeout de 3 segundos para evitar bloqueos prolongados.
   *
   * @param key - Clave del indicador en la respuesta de salud
   */
  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        HEALTH_CHECK_TIMEOUT_MS,
      );

      try {
        const response = await fetch(this.endpoint, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status < 500) {
          return indicator.up({ endpoint: this.endpoint, statusCode: response.status });
        }

        return indicator.down({ endpoint: this.endpoint, error: `Estado ${response.status}` });
      } catch (error: unknown) {
        clearTimeout(timeoutId);

        const isTimeout = error instanceof Error && error.name === 'AbortError';
        const message = isTimeout
          ? `Timeout después de ${HEALTH_CHECK_TIMEOUT_MS}ms`
          : error instanceof Error
            ? error.message
            : String(error);

        return indicator.down({ endpoint: this.endpoint, error: message });
      }
    } catch (error: unknown) {
      return indicator.down({
        endpoint: this.endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
