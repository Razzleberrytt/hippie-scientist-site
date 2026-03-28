export type ProviderName = 'openai-responses' | 'anthropic-structured';

export interface ProviderRequest {
  task: string;
  prompt: string;
  temperature?: number;
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
