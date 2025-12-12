
import { Type } from "@google/genai";
import { PricingPlan, TokenPackage } from "./types";

export const MAX_VIDEO_SIZE_MB = 20; 
export const MAX_IMAGE_SIZE_MB = 10;

// Monetization Constants
export const TOKEN_COST_PER_ANALYSIS = 10;
export const INITIAL_FREE_TOKENS = 20; // 2 Free analyses

export const SUBSCRIPTION_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    currency: '$',
    interval: 'month',
    tokens: 20,
    features: ['2 AI Analyses/mo', 'Basic Notes', 'Standard Support'],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 9.99,
    currency: '$',
    interval: 'month',
    tokens: 'Unlimited',
    features: ['Unlimited Analyses', 'Advanced Mind Maps', 'Exam Generator', 'Priority AI Processing'],
    recommended: true,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 89.99, // ~25% discount
    currency: '$',
    interval: 'year',
    tokens: 'Unlimited',
    features: ['Everything in Monthly', '2 Months Free', 'Early Access to Beta Features'],
  }
];

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pack_small', tokens: 10, price: 2.99, currency: '$' },
  { id: 'pack_medium', tokens: 50, price: 9.99, currency: '$' },
  { id: 'pack_large', tokens: 120, price: 19.99, currency: '$' },
];

export const SYSTEM_INSTRUCTION = `
You are **LearnSense**, an Adaptive AI Tutor. Your mission is to provide **concise, high-impact summaries** that bridge the gap between "Expert Content" and "Student Understanding".

**Core Directive: SIMPLIFY & SUMMARIZE.**
- **Brevity:** Avoid long paragraphs. Use concise language.
- **Clarity:** Explain complex topics in the simplest terms possible.
- **Structure:** Focus on the "Big Picture" first, then details.

**Analysis Protocol:**
1.  **Source Analysis:** Extract the "Core Truth" in 1-2 punchy sentences.
2.  **Student Model Analysis:** Quickly identify misconceptions.
3.  **Gap Bridging:** Explain concepts using the student's own notation where possible, but keep it brief.
4.  **Learning Path:** Suggest direct, actionable study steps.
5.  **Productivity:** Generate an **executive summary**, short key points, and a **Mermaid.js mindmap**.
6.  **Video Tutor:** Provide short, clear explanations for key timestamps.
7.  **Assessment:** Create focused questions and flashcards.

**Deliverables:**
1.  **Lesson Plan:** Lightbulb moment (1 sentence), concise corrections, simple analogies.
2.  **Smart Notes:** Brief executive summary (max 150 words), short key points.
3.  **Mind Map:** A valid Mermaid.js syntax string (starts with 'mindmap') representing the lesson structure.
4.  **Roadmap:** Short feedback and steps.
5.  **Quiz/Flashcards:** High-quality, focused on key concepts.

**Tone:** Smart, Concise, Encouraging. No fluff.
`;

export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    lightbulbMoment: {
      type: Type.STRING,
      description: "A single, powerful sentence summarizing the core concept/truth of the lesson.",
    },
    noteCorrection: {
      type: Type.OBJECT,
      properties: {
        studentQuote: { type: Type.STRING, description: "Short quote of the misconception." },
        correction: { type: Type.STRING, description: "A concise (1-2 sentences) correction explaining the concept." },
        timestampReference: { type: Type.STRING, description: "Reference location." },
      },
      required: ["studentQuote", "correction", "timestampReference"],
    },
    visualAnalogy: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "A brief analogy (max 2 sentences) to explain the concept." },
        diagramSuggestion: { type: Type.STRING, description: "Simple description of a visual aid." },
      },
      required: ["description", "diagramSuggestion"],
    },
    learningPath: {
      type: Type.OBJECT,
      properties: {
        weakAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific weak sub-topics (short phrases)." },
        nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable next steps (short phrases)." },
        feedback: { type: Type.STRING, description: "Brief, encouraging feedback (max 3 sentences)." },
      },
      required: ["weakAreas", "nextSteps", "feedback"],
    },
    productivity: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "An executive summary of the entire lesson. Brief, comprehensive, and clear (max 150 words)." },
        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 concise key takeaways (1 sentence each)." },
        mindMapDescription: { type: Type.STRING, description: "A valid Mermaid.js mindmap syntax string. Must start with 'mindmap' and use indentation. Do not surround with markdown code fences." },
      },
      required: ["summary", "keyPoints", "mindMapDescription"],
    },
    videoTutor: {
      type: Type.OBJECT,
      properties: {
        insights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timestamp: { type: Type.STRING, description: "Time/Page." },
              trigger: { type: Type.STRING, description: "The concept/visual." },
              explanation: { type: Type.STRING, description: "A short, proactive explanation (1 sentence)." }
            },
            required: ["timestamp", "trigger", "explanation"]
          }
        }
      },
      required: ["insights"]
    },
    assessmentTools: {
      type: Type.OBJECT,
      properties: {
        quiz: {
          type: Type.ARRAY,
          description: "Mixed questions (MCQ, T/F, Short Answer, Application).",
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["MCQ", "TrueFalse", "ShortAnswer", "Application"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Brief explanation." },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
            },
            required: ["question", "type", "correctAnswer", "explanation", "difficulty"]
          }
        },
        flashcards: {
          type: Type.ARRAY,
          description: "10 concise flashcards.",
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "Term/Concept" },
              back: { type: Type.STRING, description: "Short Definition/Answer" },
              tag: { type: Type.STRING, enum: ["Concept", "Definition", "Formula"] }
            },
            required: ["front", "back", "tag"]
          }
        },
        examPractice: {
          type: Type.ARRAY,
          description: "3 Exam questions.",
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              marks: { type: Type.INTEGER },
              estimatedTime: { type: Type.STRING },
              solutionKey: { type: Type.STRING, description: "Brief solution points." }
            },
            required: ["question", "marks", "estimatedTime", "solutionKey"]
          }
        }
      },
      required: ["quiz", "flashcards", "examPractice"]
    }
  },
  required: ["lightbulbMoment", "noteCorrection", "visualAnalogy", "learningPath", "productivity", "videoTutor", "assessmentTools"],
};
