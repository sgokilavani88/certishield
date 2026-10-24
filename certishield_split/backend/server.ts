import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK on server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Forensic Analysis Endpoint
app.post('/api/gemini/analyze-certificate', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', claimedData } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No certificate image provided for forensic analysis' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check environment variables.',
      });
    }

    // Clean base64 string if data url prefix is included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
You are a senior forensic document examiner specializing in credential verification, anti-tampering, and digital authenticity for educational certificates.
Examine this certificate image thoroughly and perform:
1. Optical Character & Metadata Extraction:
   - Extract the holder name, institution name, course/degree, grade/score, issue date, and any visible certificate ID.
2. Visual Forensic Inspection:
   - Font consistency (look for mismatched font sizes, differing baseline heights, digital text typed over scanned paper).
   - Seal & Emblem Inspection (look for pixelated pasted logos, artificial drop shadows, mismatched color gamut, edges from lasso tools).
   - Alignment & Typography (check margins, kerning anomalies, uneven lines).
   - Date & Text Plausibility (detect impossible dates like Feb 31, typo in institution names, anomalous grade format).
   - Signs of Photoshop or digital cloning.
3. Risk Assessment:
   - Risk level: "LOW" (authentic appearance, matching typography), "MEDIUM" (minor anomalies, compression artifacts), "HIGH" (suspicious font or seal edits), "CRITICAL" (blatant digital tampering or contradictory details).
   - Overall advisory explanation.

${claimedData ? `Claimed verification details for reference: ${JSON.stringify(claimedData)}` : ''}

Note: Your analysis is strictly advisory forensic intelligence.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction:
          'You are a rigorous forensic document auditor. Analyze certificates for signs of tampering, font replacement, forged seals, and metadata extraction. Output valid JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            holderName: { type: Type.STRING, description: 'Full name on the certificate' },
            institutionName: { type: Type.STRING, description: 'Issuer or university name' },
            courseName: { type: Type.STRING, description: 'Degree, certificate, or course title' },
            grade: { type: Type.STRING, description: 'Grade, CGPA, percentage, or honors designation' },
            issueDate: { type: Type.STRING, description: 'Date of issue in YYYY-MM-DD or readable format' },
            certificateId: { type: Type.STRING, description: 'Visible certificate reference ID or serial number' },
            riskLevel: {
              type: Type.STRING,
              description: 'Risk rating: LOW, MEDIUM, HIGH, or CRITICAL',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'AI confidence score from 0 to 100 on the extraction accuracy',
            },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Category: Typography, Seal, Alignment, Date, or Tamper' },
                  description: { type: Type.STRING, description: 'Clear explanation of the anomaly detected' },
                  severity: { type: Type.STRING, description: 'low, medium, or high' },
                },
                required: ['category', 'description', 'severity'],
              },
            },
            visualObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key forensic observations regarding ink, resolution, seal, and texture',
            },
            overallAssessment: {
              type: Type.STRING,
              description: 'Executive forensic summary of the certificate inspection',
            },
          },
          required: [
            'holderName',
            'institutionName',
            'courseName',
            'riskLevel',
            'confidenceScore',
            'anomalies',
            'visualObservations',
            'overallAssessment',
          ],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Empty response received from Gemini analysis');
    }

    const parsedData = JSON.parse(textOutput);
    return res.json({
      success: true,
      analysis: parsedData,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Forensic analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete forensic inspection',
    });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CertiShield API] Running on http://0.0.0.0:${PORT}`);
});
