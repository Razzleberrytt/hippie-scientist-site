export type ProviderName = 'openai-responses' | 'anthropic-structured';

export interface ProviderRequest {
  task: string;
  taskId: string;
  promptVersion: string;
  prompt: string;
  schema: unknown;
  model: string;
  temperature: number;
  temperatureSource: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderResponse {
  model: string;
  rawText: string;
  structured?: unknown;
}

export interface EnrichmentProvider {
  readonly name: ProviderName;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}
