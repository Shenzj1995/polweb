import { ReplicateProvider } from "./providers/replicate";
import { FalProvider } from "./providers/fal";
import type { AIProvider } from "./types";

const providers: Record<string, AIProvider> = {};

export function getProvider(providerId: string): AIProvider {
  if (!providers[providerId]) {
    switch (providerId) {
      case "replicate":
        providers[providerId] = new ReplicateProvider();
        break;
      case "fal":
        providers[providerId] = new FalProvider();
        break;
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }
  return providers[providerId];
}
