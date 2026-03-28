import type { EnrichmentProvider, ProviderRequest, ProviderResponse } from './interface';

export class AnthropicStructuredProvider implements EnrichmentProvider {
  readonly name = 'anthropic-structured' as const;

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    // TODO: Integrate Anthropic structured output API client when credentials/runtime wiring is available.
    return {
      model: request.model,
      rawText: '',
      structured: {
        status: 'todo',
        provider: this.name,
        taskId: request.taskId,
        promptVersion: request.promptVersion,
      },
    };
  }
}
