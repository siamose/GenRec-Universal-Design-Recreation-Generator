import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, MathProblem } from "../types";

// NOTE: In a real production app, ensure this key is guarded.
// The instructions specify using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates math problems based on difficulty level using Gemini.
 */
export const generateMathProblems = async (difficulty: Difficulty, count: number): Promise<MathProblem[]> => {
  let promptContext = "";
  
  switch (difficulty) {
    case Difficulty.VERY_EASY:
      promptContext = "Addition only (1-digit + 1-digit), no carrying.";
      break;
    case Difficulty.EASY:
      promptContext = "Addition and Subtraction (1-2 digits), minimal carrying/borrowing.";
      break;
    case Difficulty.NORMAL:
      promptContext = "Addition, Subtraction, Multiplication (1-2 digits), some carrying.";
      break;
    case Difficulty.HARD:
      promptContext = "Addition, Subtraction, Multiplication, Division (2-3 digits), challenging mental math.";
      break;
    case Difficulty.VERY_HARD:
      promptContext = "Four operations (mainly 3 digits), remainders allowed.";
      break;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate ${count} unique math problems suitable for an educational worksheet.
    Difficulty Rule: ${promptContext}
    Format: Return strictly JSON.
    Style: Use standard arithmetic symbols '×' (for multiplication) and '÷' (for division). Do NOT use computer programming symbols like '*' or '/'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "The math problem expression, e.g., '5 + 3 ='" },
            answer: { type: Type.STRING, description: "The solution to the problem" }
          },
          required: ["question", "answer"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No data returned from Gemini");
  
  try {
    const problems = JSON.parse(text) as MathProblem[];
    // Post-processing to guarantee correct symbols even if AI defaults to programming symbols
    return problems.map(p => ({
      ...p,
      question: p.question.replace(/\*/g, '×').replace(/\//g, '÷')
    }));
  } catch (e) {
    console.error("Failed to parse math JSON", e);
    return [];
  }
};

/**
 * Generates a coloring page image prompt and fetches image.
 * Returns { problem: string, solution: string | null }
 */
export const generateColoringPage = async (theme: string, difficulty: Difficulty, includeAnswer: boolean): Promise<{problem: string, solution: string | null}> => {
  let requirements = "";
  let levelDesc = "";
  
  switch (difficulty) {
    case Difficulty.VERY_EASY:
      levelDesc = '"very easy" coloring page for toddlers';
      requirements = `
- Line thickness: Extra thick
- Coloring areas: 2-4 large areas
- Color count: Structure expressible with 2-3 colors
- Shapes must be simple with high visibility
- Complex patterns prohibited
`;
      break;
    case Difficulty.EASY:
      levelDesc = '"easy" coloring page for toddlers through early elementary grades';
      requirements = `
- Line thickness: Thick
- Coloring areas: 4-6 areas
- Color count: Composition assuming 3-4 colors
- Minimize fine details
`;
      break;
    case Difficulty.NORMAL:
      levelDesc = '"standard" coloring page for all ages';
      requirements = `
- Line thickness: Medium
- Coloring areas: 6-10 areas
- Color count: Assuming 4-6 colors
- Structure that reasonably conveys theme characteristics
- Avoid excessive detail
`;
      break;
    case Difficulty.HARD:
      levelDesc = '"somewhat difficult" coloring page for elementary students through elderly';
      requirements = `
- Line thickness: Somewhat thin
- Coloring areas: 12-14 areas
- Color count: Complexity assuming 6+ colors
- Structure with satisfying coloring experience
- STRICTLY PROHIBITED: Unnecessary fine patterns, hatching, or intricate textures inside objects.
- Keep object outlines clear.
`;
      break;
    case Difficulty.VERY_HARD:
      levelDesc = '"difficult" coloring page for mid-elementary through elderly';
      requirements = `
- Line thickness: Thin
- Coloring areas: 14-16 areas
- Color count: Fine structure assuming 8+ colors
- Increase detailed depiction compared to Level 4 while maintaining visibility
- STRICTLY PROHIBITED: Unnecessary fine patterns, hatching, or intricate textures inside objects that interfere with object recognition.
- Keep object outlines clear and distinct.
`;
      break;
  }

  const prompt = `Generate a ${levelDesc}.
Theme: ${theme}
【Requirements】
${requirements}
- Must show entire subject in composition
- MUST generate as uncolored line art (no pre-colored areas)
- Output: Monochrome line art. White background.`;

  // 1. Generate Line Art
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      }
    }
  });

  let lineArtUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
       lineArtUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  if (!lineArtUrl) throw new Error("No image generated");

  // If answer is not requested, return early
  if (!includeAnswer) {
    return { problem: lineArtUrl, solution: null };
  }

  // 2. Generate Colored Version (Answer Key)
  // We use the generated line art as input and ask Gemini to color it.
  const base64Data = lineArtUrl.split(',')[1];
  const mimeType = lineArtUrl.split(';')[0].split(':')[1];
  
  const colorPrompt = `Use this line art to create a finished, colored illustration. 
  Theme: ${theme}. 
  Style: Soft, inviting colors suitable for elderly or children. 
  Keep the composition exactly the same as the reference.`;

  let coloredUrl = lineArtUrl; // Fallback to line art if coloring fails
  
  try {
    const colorResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
           { inlineData: { data: base64Data, mimeType: mimeType } },
           { text: colorPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
        }
      }
    });

    for (const part of colorResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
         coloredUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.warn("Failed to generate colored answer key, using line art as fallback", e);
  }

  return { problem: lineArtUrl, solution: coloredUrl };
};