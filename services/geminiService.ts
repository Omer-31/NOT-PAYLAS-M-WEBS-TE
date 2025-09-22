/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set. AI features may not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

const handleApiError = (error: unknown, context: string) => {
    console.error(`Error calling Gemini API for ${context}:`, error);
    throw new Error(`Gemini API ile ${context} sırasında bir hata oluştu.`);
};

/**
 * Generates a summary for a given text using the Gemini API.
 * @param text The text to summarize.
 * @returns The generated summary as a string.
 */
export async function generateSummary(text: string): Promise<string> {
    const prompt = `Aşağıdaki metni akademik bir ders notu özeti olarak, anahtar noktaları vurgulayarak ve anlaşılır bir dille özetle:\n\n---\n\n${text}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        if (response.text) {
            return response.text.trim();
        } else {
            throw new Error('API yanıtında metin içeriği bulunamadı.');
        }
    } catch (error) {
        handleApiError(error, "özet oluşturma");
        return ""; // Should be unreachable due to throw
    }
}

/**
 * Generates a quiz from the given text.
 * @param text The content of the note to generate a quiz from.
 * @returns A JSON object representing the quiz.
 */
export async function generateQuiz(text: string): Promise<any> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Bu akademik metne dayanarak 3 adet çoktan seçmeli (4 şıklı) soru hazırla. Sorulardan sadece bir tanesinin doğru cevabı olmalı. Cevap şıkkını 'answer' alanında belirt. \n\nMETİN: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            answer: { type: Type.STRING }
                        },
                        required: ["question", "options", "answer"]
                    }
                }
            }
        });

        if (response.text) {
             const jsonStr = response.text.trim();
             return JSON.parse(jsonStr);
        } else {
             throw new Error('API yanıtında quiz içeriği bulunamadı.');
        }
    } catch (error) {
        handleApiError(error, "sınav oluşturma");
        return null; // Should be unreachable
    }
}

/**
 * Generates relevant tags for a note based on its title and description.
 * @param title The title of the note.
 * @param description The description of the note.
 * @returns An array of suggested tags.
 */
export async function generateTags(title: string, description: string): Promise<string[]> {
    const content = `Başlık: ${title}\nAçıklama: ${description}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Bu ders notu için en uygun 5 anahtar kelimeyi (etiketi) listele. Cevabı sadece JSON dizisi olarak ver. Örnek: ["Veri Yapıları", "Algoritma", "Vize Notları"]\n\nİÇERİK: "${content}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        if (response.text) {
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr);
        } else {
            throw new Error('API yanıtında etiket içeriği bulunamadı.');
        }
    } catch (error) {
        handleApiError(error, "etiket önerme");
        return []; // Should be unreachable
    }
}