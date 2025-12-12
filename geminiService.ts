
import { GoogleGenAI } from "@google/genai";
import { ReviewType, ReviewFormData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReview = async (data: ReviewFormData): Promise<string> => {
  const { type, studentName, lessonContent, phonicsInfo, sessionNotes, focusRating } = data;

  let prompt = "";
  // High-level guidance for the AI
  const systemInstruction = `You are a professional ESL teacher's assistant. You write encouraging, very simple English reviews (A1-A2 level). 
  You avoid complex words. You NEVER use bullet points. You use 'class' instead of 'session'. 
  CRITICAL: This is a ONE-ON-ONE lesson. There is only one teacher and one student. 
  NEVER use 'us' or 'we'. ALWAYS use 'me' or 'I' when referring to the teacher-student interaction (e.g., 'he told me' instead of 'he told us').`;

  // Focus rating impacts the tone significantly
  let focusDetail = "";
  if (focusRating === 5) {
    focusDetail = "The student's focus was absolutely perfect (5/5). Use words like 'outstanding concentration', 'incredible energy', and 'exceptional focus'. Make this a major highlight of the review.";
  } else if (focusRating === 4) {
    focusDetail = "The student had great focus (4/5). Praise their attention and how it helped them learn faster.";
  } else if (focusRating === 3) {
    focusDetail = "The student's focus was okay (3/5). Encourage them to stay a bit more concentrated next time to catch every detail.";
  } else {
    focusDetail = `The student's focus was low (${focusRating}/5). Address this gently but clearly. Mention that staying focused is key to learning and encourage them to try harder to listen to me next time.`;
  }

  const topicContext = lessonContent ? `Topic: ${lessonContent}` : "";
  const phonicsContext = phonicsInfo ? `Phonics & Words: ${phonicsInfo}` : "";

  switch (type) {
    case ReviewType.IDS:
      prompt = `
        Generate a detailed IDS review for ${studentName} for our one-on-one class.
        
        Details to include:
        - ${topicContext}
        - ${phonicsContext}
        - Engagement Context: ${focusDetail}
        - Transcript/Notes: ${sessionNotes}

        STRICT FORMAT REQUIREMENTS:
        1. USE EXACT HEADINGS: 'Improvements:', 'Difficulties:', and 'Suggestions:'.
        2. NO BULLET POINTS. Use only rich, detailed paragraphs.
        3. 'Improvements:' must be a long paragraph covering EVERYTHING from the notes/transcript and phonics. 
        4. Integrate the focus rating (${focusRating}/5) deeply into the 'Improvements' or as a concluding positive reinforcement.
        5. REMEMBER: This is one-on-one. Use "I" and "me", never "we" or "us".
      `;
      break;

    case ReviewType.G_REVIEW:
      prompt = `
        Generate a GENERAL ESL review for a one-on-one class. 
        RULES:
        - NO names. NO specific lesson content. NO phonics.
        - DO NOT mention "General English Practice" or "session". Use "class".
        - ALWAYS use 'you' & 'your'.
        - Refer to the interaction as between 'you' and 'me'. NEVER use 'us'.
        - Focus context: ${focusDetail} (Make the focus/engagement the central theme of this review).
        - STERN RULE: Must be 100% unique, fresh, and creative. Never recycle sentences.
        - TONE: Warm, personal, and encouraging.
        - LENGTH: 120-160 words.
        - No bullet points.
      `;
      break;

    case ReviewType.S_REVIEW:
      prompt = `
        Generate a SPECIFIC student review for ${studentName} for our one-on-one class.
        RULES:
        - Incorporate BOTH the transcript notes (${sessionNotes}) and the phonics/words (${phonicsInfo}).
        - Mention the topic (${lessonContent}) if provided.
        - DO NOT use the phrase "General English Practice".
        - Use the word "class" instead of "session".
        - TONE: Personal letter style using 'you' and 'your'.
        - Focus: ${focusDetail} (Ensure the focus rating significantly changes the tone of the message).
        - Refer to yourself as 'I' or 'me'. NEVER use 'us' or 'we'.
        - LENGTH: 120-150 words.
        - No bullet points.
      `;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 1.0, 
        topP: 0.95,
      },
    });

    return response.text || "Failed to generate review.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to communicate with the AI.");
  }
};
