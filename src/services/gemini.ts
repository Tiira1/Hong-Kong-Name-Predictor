export interface NamePrediction {
  syllables: {
    pinyin: string;
    suggestions: {
      char: string;
      meaning?: string;
    }[];
  }[];
  fullNames: {
    chinese: string;
    jyutping: string;
    explanation: string;
  }[];
}

export async function predictHKName(pinyin: string, gender: string): Promise<NamePrediction> {
  // 1. 从环境变量里拿钥匙
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  // 2. 向 DeepSeek 发起 HTTP 请求 (像寄快递一样)
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a Hong Kong naming expert. Return ONLY JSON. 
          Rules:
          1. Use Hong Kong naming conventions (Traditional Chinese).
          2. For each syllable in the Pinyin, provide the most likely characters.
          3. Suggest 3-5 full names with Jyutping and explanations.`
        },
        {
          role: "user",
          content: `Predict names for Pinyin: "${pinyin}" and Gender: "${gender}".`
        }
      ],
      // 强制 AI 只吐出 JSON 格式，不废话
      response_format: { type: 'json_object' }
    })
  });

  const result = await response.json();
  // 提取 AI 回复的文本内容并转成对象
  return JSON.parse(result.choices[0].message.content);
}
