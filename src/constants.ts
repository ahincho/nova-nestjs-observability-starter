/**
 * Tokens de inyección de dependencias para el módulo de observabilidad.
 */

/**
 * Token de inyección para las opciones de filtrado resueltas del interceptor.
 * Se usa para inyectar la configuración de exclusión de rutas y normalización.
 */
export const OBSERVABILITY_OPTIONS = Symbol('OBSERVABILITY_OPTIONS');
