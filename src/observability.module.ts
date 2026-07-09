/**
 * Módulo dinámico principal de observabilidad para NestJS.
 * Integra OpenTelemetry con NestJS proporcionando auto-instrumentación,
 * trazas distribuidas, métricas y health check del Collector.
 *
 * La auto-instrumentación de OTel se encarga de Golden Signals, normalización
 * de URIs y trazas HTTP automáticamente.
 *
 * Uso:
 * ```typescript
 * @Module({
 *   imports: [
 *     ObservabilityModule.forRoot({
 *       serviceName: 'mi-servicio',
 *       otlp: { endpoint: 'http://collector:4318' },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { DynamicModule, Module, Global, Provider } from '@nestjs/common';
import { ObservabilityModuleOptions } from './interfaces/observability-module-options.interface';
import { resolveOptions } from './config/resolve-options';
import { OBSERVABILITY_OPTIONS } from './constants';
import { OtelSdkInitializer } from './initializer/otel-sdk-initializer';
import { CollectorHealthIndicator } from './health/collector-health-indicator';

/**
 * Módulo global de observabilidad que integra OpenTelemetry con NestJS.
 * Registra el SDK de OTel con auto-instrumentación y health check del Collector.
 *
 * Configuración mediante `forRoot(options?)`:
 * - Si `enabled: false`: retorna módulo vacío sin providers
 * - Inicializa el SDK de OTel con auto-instrumentación completa
 * - Registra health check del Collector
 */
@Global()
@Module({})
export class ObservabilityModule {
  /**
   * Configura el módulo de observabilidad con las opciones proporcionadas.
   * Resuelve opciones con defaults y variables de entorno, inicializa el SDK
   * y registra los providers necesarios como módulo global.
   *
   * @param options - Opciones de configuración (todas opcionales con defaults sensatos)
   * @returns Módulo dinámico configurado
   */
  static forRoot(options?: ObservabilityModuleOptions): DynamicModule {
    const resolvedOptions = resolveOptions(options);

    if (!resolvedOptions.enabled) {
      return { module: ObservabilityModule, providers: [], exports: [] };
    }

    // Inicializar SDK de OpenTelemetry (auto-instrumentación incluida)
    OtelSdkInitializer.initialize(resolvedOptions);

    const providers: Provider[] = [
      { provide: OBSERVABILITY_OPTIONS, useValue: resolvedOptions },
      OtelSdkInitializer,
      CollectorHealthIndicator,
    ];

    return {
      module: ObservabilityModule,
      providers,
      exports: [OBSERVABILITY_OPTIONS, CollectorHealthIndicator],
    };
  }
}
