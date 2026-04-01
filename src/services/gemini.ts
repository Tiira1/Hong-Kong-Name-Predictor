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
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("请在 Vercel 环境变量中设置 VITE_DEEPSEEK_API_KEY");
  }

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
          content: `You are a professional Hong Kong naming consultant. 
          Return ONLY a valid JSON object. 
          REQUIRED STRUCTURE:
          {
            "syllables": [{ "pinyin": "string", "suggestions": [{ "char": "string", "meaning": "string" }] }],
            "fullNames": [{ "chinese": "string", "jyutping": "string", "explanation": "string" }]
          }`
        },
        {
          role: "user",
          content: `Cantonese pinyin: "${pinyin}", Gender: "${gender}". Generate names.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    })
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error("DeepSeek 账户余额不足，请充值。");
    }
    throw new Error(result.error?.message || "API 请求失败");
  }

  let content = result.choices?.[0]?.message?.content || "";
  
  // 更加鲁棒的 JSON 提取逻辑
  // 1. 尝试直接解析
  try {
    return JSON.parse(content) as NamePrediction;
  } catch (e) {
    // 2. 如果解析失败，尝试剥离 Markdown 代码块
    console.warn("直接解析 JSON 失败，尝试清洗数据...");
    const jsonMatch = content.match(/\{[\s\S]*\}/); // 提取大括号内的所有内容
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as NamePrediction;
      } catch (innerE) {
        console.error("清洗后解析依然失败:", jsonMatch[0]);
      }
    }
    throw new Error("AI 返回的数据格式无法识别，请重试。");
  }
}
