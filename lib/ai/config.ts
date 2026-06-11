export type AIProvider = "openagentic" | "bluesminds";

export interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getAIProviderConfig(provider?: AIProvider): {
  provider: AIProvider;
  config: AIProviderConfig;
} {
  const selectedProvider = (provider ||
    process.env.NEXT_PUBLIC_AI_PROVIDER ||
    "openagentic") as AIProvider;

  const configs: Record<AIProvider, AIProviderConfig> = {
    openagentic: {
      apiKey: process.env.OPENAGENTIC_API_KEY!,
      baseUrl: process.env.OPENAGENTIC_BASE_URL!,
      model: process.env.OPENAGENTIC_MODEL!,
    },
    bluesminds: {
      apiKey: process.env.BLUESMINDS_API_KEY!,
      baseUrl: process.env.BLUESMINDS_BASE_URL!,
      model: process.env.BLUESMINDS_MODEL!,
    },
  };

  const config = configs[selectedProvider];

  if (!config || !config.apiKey || !config.baseUrl || !config.model) {
    throw new Error(
      `Invalid or incomplete configuration for provider: ${selectedProvider}`,
    );
  }

  return {
    provider: selectedProvider,
    config,
  };
}
