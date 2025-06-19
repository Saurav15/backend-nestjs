/**
 * Enum for document ingestion process status.
 * - PENDING: Awaiting processing
 * - STARTED: Ingestion started
 * - PROCESSING: Ingestion in progress
 * - COMPLETED: Ingestion completed successfully
 * - FAILED: Ingestion failed
 */
export enum IngestionStatus {
  PENDING = 'pending',
  STARTED = 'started',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
