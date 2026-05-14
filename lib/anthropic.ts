import Anthropic from "@anthropic-ai/sdk";

type EncouragementOptions = {
  firstName:   string;
  totalDaysRead: number;
  streak:      number;
};

export async function generateEncouragement({
  firstName,
  totalDaysRead,
  streak,
}: EncouragementOptions): Promise<string> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 150,
    messages: [
      {
        role:    "user",
        content:
          `Write a warm, personal 2–3 sentence encouragement for ${firstName}, ` +
          `who has read scripture ${totalDaysRead} total days this summer` +
          (streak > 1 ? ` and is on a ${streak}-day streak` : "") +
          `. Keep it sincere, brief, and uplifting. Address them by name. ` +
          `Return only the encouragement text with no preamble or formatting.`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected Claude response type");
  return block.text.trim();
}
