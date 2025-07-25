const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const getGeminiResponse = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data?.candidates?.length) {
      console.warn("No candidates returned:", data);
      return "🤖 No valid response.";
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    return text || "🤖 No answer generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ chat bot failed.";
  }
};
