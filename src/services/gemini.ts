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
// 1. 把 DeepSeek 给回来的原始包裹拆开
  const result = await response.json();

  // 2. 检查 DeepSeek 是不是在骂你（比如 402 没钱了）
  if (!response.ok) {
    if (response.status === 402) {
      throw new Error("DeepSeek 账户余额不足，请去后台充值。");
    }
    throw new Error(`API 报错了：${result.error?.message || '未知错误'}`);
  }

  // 3. 检查包裹里到底有没有我们要的东西（choices 列表）
  if (!result.choices || result.choices.length === 0) {
    throw new Error("AI 没给回任何结果，请稍后再试。");
  }

  // 4. 确认没问题了，再把里面的内容转成网页能读懂的格式
  try {
    return JSON.parse(result.choices[0].message.content);
  } catch (e) {
    console.error("JSON 解析失败:", result.choices[0].message.content);
    throw new Error("AI 返回的格式不对，请再试一次。");
  }
}
