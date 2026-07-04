import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

export const handleChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.toLowerCase().trim() === 'hi! there') {
      return res.status(200).json({ response: 'Hi! how may I help you today?' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Simulate chat response when API key is missing
      const mockResponses: { [key: string]: string } = {
        "hello": "Hello! How can I assist you with your HR needs today?",
        "hi": "Hi there! How can I help you today?",
        "salary": "You can view your salary details in the 'Salary Info' tab on your profile page. As an employee, you can track your earnings and deductions, but only an admin can configure or modify these details.",
        "attendance": "You can check your attendance logs, check in, or check out in the 'Attendance' page from the sidebar menu.",
        "leave": "You can request time off or check your allocations and request status under the 'Time Off' section in the sidebar menu."
      };
      
      const lowerMsg = message.toLowerCase();
      let reply = "I am your HR Assistant. Please configure the `GEMINI_API_KEY` in your `.env` file to activate me! In the meantime, I can give you quick tips: you can track your salary under your Profile (Salary Info tab), log your attendance in the Attendance tab, or request leave in the Time Off section. How can I help you?";
      
      for (const [key, val] of Object.entries(mockResponses)) {
        if (lowerMsg.includes(key)) {
          reply = `${val}\n\n*(Note: AI Chatbot is running in fallback mode because GEMINI_API_KEY is not configured in .env)*`;
          break;
        }
      }
      
      // Simulate a small delay for a realistic typing experience
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.status(200).json({ response: reply });
    }

    // Call actual Gemini API
    const mappedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' || msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.text }]
    }));
    
    // Add current user message
    mappedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: mappedHistory,
          systemInstruction: {
            parts: [
              {
                text: "You are a helpful and polite company HR assistant for SankalpHR. You can help employees with information about their profiles, company policies, time-off requests, and work attendance. Keep responses concise, clear, and professional."
              }
            ]
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(500).json({ error: 'Failed to communicate with LLM API.' });
    }

    const data = await response.json() as any;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't formulate a response.";

    return res.status(200).json({ response: reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat message.' });
  }
};
