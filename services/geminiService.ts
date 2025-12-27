
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MoleculeData } from "../types";
import { CPK_COLORS, ATOM_RADII } from "../constants";
import { loadFromCache, saveToCache, cleanKey, STORAGE_KEYS } from "./storageService";

const getElementColor = (element: string): string => {
  return CPK_COLORS[element] || CPK_COLORS.DEFAULT;
};

const getElementRadius = (element: string): number => {
  return ATOM_RADII[element] || ATOM_RADII.DEFAULT;
};

// Define the schema for the Gemini response
const moleculeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Common name of the substance in Simplified Chinese" },
    formula: { type: Type.STRING, description: "Chemical formula like H2O" },
    description: { type: Type.STRING, description: "A fun, kid-friendly explanation of what this molecule is like in Simplified Chinese." },
    funFact: { type: Type.STRING, description: "A surprising or funny fact about this substance in Simplified Chinese." },
    properties: {
      type: Type.OBJECT,
      properties: {
        state: { type: Type.STRING, description: "State at room temperature in Chinese (e.g. 液态, 气态)" },
        meltingPoint: { type: Type.STRING, description: "Melting point approx in Chinese (e.g. 0°C)" }
      },
      required: ["state", "meltingPoint"]
    },
    atoms: {
      type: Type.ARRAY,
      description: "List of atoms with their 3D coordinates. Use VSEPR theory to approximate geometry. Center the molecule around 0,0,0.",
      items: {
        type: Type.OBJECT,
        properties: {
          element: { type: Type.STRING, description: "Element symbol (e.g. H, O, C)" },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          z: { type: Type.NUMBER }
        },
        required: ["element", "x", "y", "z"]
      }
    },
    bonds: {
      type: Type.ARRAY,
      description: "List of connections between atoms by index in the atoms array.",
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.INTEGER, description: "Index of start atom" },
          target: { type: Type.INTEGER, description: "Index of end atom" }
        },
        required: ["source", "target"]
      }
    }
  },
  required: ["name", "formula", "description", "funFact", "properties", "atoms", "bonds"]
};

// Generate molecule data using the recommended model for complex reasoning tasks
export const generateMoleculeData = async (substance: string): Promise<MoleculeData> => {
  // 1. Check Local Cache First
  const cacheKey = `${STORAGE_KEYS.DATA_PREFIX}${cleanKey(substance)}`;
  const cachedData = loadFromCache<MoleculeData>(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  // 2. If not in cache, request from API
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    // Initialize Gemini API client correctly
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Create a 3D molecular model for the substance: "${substance}".
      
      Target audience: Middle school students.
      Tone: Fun, educational, enthusiastic.
      
      Instructions:
      1. Identify the molecule.
      2. Provide approximate 3D coordinates (x, y, z) for atoms to visualize the shape correctly (e.g., Water is bent, Methane is tetrahedral). Scale coordinates so bonds are roughly length 1.0 to 1.5.
      3. Provide bond connections.
      4. LANGUAGE REQUIREMENT: All text content (name, description, funFact, properties) MUST be in Simplified Chinese (简体中文).
      5. The description should be lively, interesting, and easy for primary/middle school students to understand.
    `;

    // Complex STEM task: Use 'gemini-3-pro-preview'
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: moleculeSchema,
        temperature: 0.3, // Lower temperature for more accurate structural data
      }
    });

    // Access the text property directly (not a method)
    const text = response.text;
    if (!text) throw new Error("No data received from AI");

    const rawData = JSON.parse(text);

    // Post-process to add visual properties (colors, radii) based on element type
    const processedAtoms = rawData.atoms.map((atom: any, index: number) => ({
      ...atom,
      id: index,
      color: getElementColor(atom.element),
      radius: getElementRadius(atom.element)
    }));

    const finalData = {
      ...rawData,
      atoms: processedAtoms
    };

    // 3. Save to Local Cache
    saveToCache(cacheKey, finalData);

    return finalData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// Generate speech using the designated text-to-speech model
export const generateMoleculeSpeech = async (text: string, moleculeNameForCache?: string): Promise<string> => {
  // 1. Check Local Cache
  let cacheKey = '';
  if (moleculeNameForCache) {
    cacheKey = `${STORAGE_KEYS.AUDIO_PREFIX}${cleanKey(moleculeNameForCache)}`;
    const cachedAudio = loadFromCache<string>(cacheKey);
    if (cachedAudio) {
      return cachedAudio;
    }
  }

  // 2. Generate if not cached
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  // Use the dedicated TTS model
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio");
  }

  // 3. Save to Cache
  if (cacheKey) {
    saveToCache(cacheKey, base64Audio);
  }

  return base64Audio;
};
