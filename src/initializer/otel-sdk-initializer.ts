/**
 * Inicializador del SDK de OpenTelemetry para NestJS.
 * Configura y arranca el NodeSDK programáticamente antes de que NestJS cree la aplicación Express,
 * permitiendo que la auto-instrumentación parchee los módulos HTTP correctamente.
 */

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from '@opentelemetry/semantic-conventions/incubating';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

import { ResolvedObservabilityOptions } from '../interfaces/resolved-options.interface';

/**
 * Inicializa el NodeSDK de OpenTelemetry programáticamente.
 * Configura resource, exporters, auto-instrumentaciones y metric reader.
 * Se ejecuta ANTES de que NestJS cree la aplicación Express (vía NovaPlatformFactory)
 * para que la auto-instrumentación pueda parchear los módulos HTTP correctamente.
 *
 * Implementa OnModuleDestroy para exportar telemetría pendiente al destruir el módulo.
 */
@Injectable()
export class OtelSdkInitializer implements OnModuleDestroy {
  /** Instancia del SDK de OpenTelemetry */
  private static sdk: NodeSDK | null = null;

  /**
   * Inicializa el SDK con las opciones resueltas.
   * Debe invocarse antes de NestFactory.create() para que la auto-instrumentación
   * pueda parchear los módulos HTTP correctamente.
   *
   * Si el SDK falla al inicializar, registra el error en consola y no lanza excepción
   * (principio de resiliencia: la observabilidad nunca debe impedir el funcionamiento del servicio).
   *
   * @param options - Opciones de configuración resueltas (con defaults aplicados)
   */
  static initialize(options: ResolvedObservabilityOptions): void {
    try {
      // Configurar Resource con atributos del servicio
      const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: options.serviceName,
        [ATTR_SERVICE_NAMESPACE]: options.serviceNamespace,
        [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: options.environment,
      });

      // Configurar trace exporter si trazas están habilitadas
      const traceExporter = options.traces.enabled
        ? new OTLPTraceExporter({
            url: `${options.otlp.endpoint}/v1/traces`,
            headers: options.otlp.headers,
            timeoutMillis: options.otlp.timeout,
          })
        : undefined;

      // Configurar metric reader si métricas están habilitadas
      const metricReader = options.metrics.enabled
        ? new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
              url: `${options.otlp.endpoint}/v1/metrics`,
              headers: options.otlp.headers,
              timeoutMillis: options.otlp.timeout,
            }),
            exportIntervalMillis: options.metrics.exportIntervalMs,
          })
        : undefined;

      // Configurar log exporter si logs están habilitados
      if (options.logs.enabled && options.logs.exportToOtlp) {
        const logExporter = new OTLPLogExporter({
          url: `${options.otlp.endpoint}/v1/logs`,
          headers: options.otlp.headers,
          timeoutMillis: options.otlp.timeout,
        });
        const loggerProvider = new LoggerProvider({
          resource,
          processors: [new BatchLogRecordProcessor(logExporter)],
        });
        logs.setGlobalLoggerProvider(loggerProvider);
      }

      // Configurar sampling ratio
      const sampler = new TraceIdRatioBasedSampler(options.traces.samplingRatio);

      // Configurar auto-instrumentaciones
      const instrumentations = [getNodeAutoInstrumentations()];

      // Crear y arrancar el SDK
      const sdkConfig: ConstructorParameters<typeof NodeSDK>[0] = {
        resource,
        instrumentations,
        sampler,
      };

      if (traceExporter) {
        sdkConfig.traceExporter = traceExporter;
      }

      if (metricReader) {
        sdkConfig.metricReaders = [metricReader];
      }

      OtelSdkInitializer.sdk = new NodeSDK(sdkConfig);
      OtelSdkInitializer.sdk.start();
    } catch (error) {
      // Principio de resiliencia: registrar error pero no impedir el arranque del servicio
      console.error(
        '[OtelSdkInitializer] Error al inicializar el SDK de OpenTelemetry:',
        error,
      );
    }
  }

  /**
   * Detiene el SDK de forma ordenada, exportando telemetría pendiente.
   * Se invoca al destruir el módulo NestJS o al cerrar la aplicación.
   */
  static async shutdown(): Promise<void> {
    if (OtelSdkInitializer.sdk) {
      await OtelSdkInitializer.sdk.shutdown();
    }
  }

  /**
   * Hook del ciclo de vida de NestJS — detiene el SDK al destruir el módulo.
   * Exporta toda la telemetría pendiente antes de cerrar.
   */
  async onModuleDestroy(): Promise<void> {
    await OtelSdkInitializer.shutdown();
  }
}
