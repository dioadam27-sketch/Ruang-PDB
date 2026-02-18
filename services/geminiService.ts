
import { GoogleGenAI } from "@google/genai";
import { Student } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTicketMessage = async (student: Student, roomName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Selamat belajar! Semangat PDB!";

  try {
    const prompt = `
      Buatkan pesan motivasi singkat (maksimal 15 kata) yang unik dan semangat untuk mahasiswa bernama ${student.name} 
      dari kelas ${student.pdbClass} yang akan mengikuti kuliah pengganti di ruang ${roomName} Gedung Nano Lantai 8.
      Gunakan bahasa Indonesia yang gaul tapi sopan.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Semangat kuliahnya!";
  } catch (error) {
    console.error("Error generating AI message:", error);
    return "Semangat mengejar ilmu!";
  }
};
