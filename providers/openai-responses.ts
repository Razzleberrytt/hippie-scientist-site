import type { EnrichmentProvider, ProviderRequest, ProviderResponse } from './interface';

export class OpenAIResponsesProvider implements EnrichmentProvider {
  readonly name = 'openai-responses' as const;

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    // TODO: Integrate OpenAI Responses API client when credentials/runtime wiring is available.
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
