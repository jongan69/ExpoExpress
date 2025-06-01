var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const responseSchema = z.object({
    template: z.string(),
    top_text: z.string(),
    bottom_text: z.string(),
});
export async function POST(req) {
    var _a, e_1, _b, _c;
    const { content } = await req.json();
    if (!content) {
        return new Response("No content provided", { status: 400 });
    }
    try {
        // Fetch meme templates and randomly select a subset
        const templatesRes = await fetch("https://api.memegen.link/templates/");
        const templates = await templatesRes.json();
        // Randomly pick 40 templates
        const shuffled = templates.sort(() => 0.5 - Math.random());
        const pickedTemplates = shuffled.slice(0, 40);
        const templatePairs = pickedTemplates.map((t) => `${t.id} (${t.name})`);
        const templateList = templatePairs.join(", ");
        // Debug: log picked templates
        console.log("Picked meme templates:", templateList);
        // Update response schema to allow multiple suggestions
        const multiResponseSchema = z.object({
            memes: z.array(z.object({
                template: z.string(),
                top_text: z.string(),
                bottom_text: z.string(),
            }))
        });
        // Setup streaming response
        const encoder = new TextEncoder();
        const transformStream = new TransformStream();
        const writer = transformStream.writable.getWriter();
        // Debug: log system prompt
        const systemPrompt = `You are a meme generator assistant. Here is a list of valid meme templates: [${templateList}]. Given a meme idea, suggest up to 12 possible memes using these templates (by id), and provide the top and bottom text for each. Respond in JSON: { "memes": [ { "template": "...", "top_text": "...", "bottom_text": "..." }, ... ] }`;
        console.log("System prompt for AI:\n", systemPrompt);
        // Chat stream
        const openaiStream = await openai.chat.completions.create({
            model: "gpt-4o-2024-11-20",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Meme idea: ${content}`,
                },
            ],
            response_format: zodResponseFormat(multiResponseSchema, "post"),
            stream: true,
        });
        try {
            for (var _d = true, openaiStream_1 = __asyncValues(openaiStream), openaiStream_1_1; openaiStream_1_1 = await openaiStream_1.next(), _a = openaiStream_1_1.done, !_a; _d = true) {
                _c = openaiStream_1_1.value;
                _d = false;
                const chunk = _c;
                if (chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
                    await writer.write(encoder.encode(JSON.stringify(chunk.choices[0].delta)));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = openaiStream_1.return)) await _b.call(openaiStream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        await writer.close();
        // Return the readable stream
        return new Response(transformStream.readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    }
    catch (error) {
        console.error(`[ai+api] Error: ${error instanceof Error ? error.message : String(error)}`);
        return new Response("Error", { status: 500 });
    }
}
//# sourceMappingURL=ai+api.js.map