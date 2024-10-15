import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';

export async function POST(request:Request) {
const messages: CoreMessage[] = [{role:'user',content:"hello how ARE you"}];

const result = await streamText({
      model: openai('gpt-4'),
      messages,
    });
    return result.toDataStreamResponse();
}
    