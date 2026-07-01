export function buildCoverImageUrl(coverImagePrompt?: string | null) {
  if (!coverImagePrompt) {
    return "";
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(coverImagePrompt)}?width=900&height=560&nologo=true`;
}
