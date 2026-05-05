import nodeFetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

type FetchLike = typeof fetch;

export function createServerFetch(): FetchLike {
  const proxyUrl =
    process.env.LOCAL_HTTPS_PROXY ||
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY;

  if (!proxyUrl) return fetch;

  const agent = new HttpsProxyAgent(proxyUrl);

  return ((input, init) => {
    return nodeFetch(input as never, {
      ...(init as Record<string, unknown>),
      agent,
    }) as unknown as ReturnType<FetchLike>;
  }) as FetchLike;
}
