import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateInput, validateApiKey } from '../utils/errorHandler';

const SYSTEM_PROMPT = `You are an expert web developer. Your task is to generate complete, functional HTML/CSS/JavaScript code for web applications based on user descriptions.

IMPORTANT RULES:
1. Generate ONLY valid HTML code that can run standalone in a browser
2. Include all CSS within <style> tags in the HTML
3. Include all JavaScript within <script> tags in the HTML
4. Make the application fully functional and interactive
5. Use modern CSS with flexbox/grid for layout
6. Ensure responsive design
7. Use a clean, professional design with good UX
8. Include proper error handling
9. Make sure the app is visually appealing with good color schemes
10. The code must be complete and ready to run - no external dependencies except standard browser APIs

Return ONLY the HTML code, nothing else. No markdown, no explanations, just the complete HTML file.`;

export const generateAppCode = async (description, apiKey) => {
  try {
    // Validate inputs
    const validatedApiKey = validateApiKey(apiKey);
    const validatedDescription = validateInput(description);

    const genAI = new GoogleGenerativeAI(validatedApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

User Request: ${validatedDescription}

Generate a complete, functional web application based on this description. The application should be ready to run immediately in a browser.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let code = text;
    if (code.includes('```html')) {
      code = code.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    } else if (code.includes('```')) {
      code = code.replace(/```\n?/g, '');
    }

    code = code.trim();

    // Validate that we have HTML
    if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
      throw new Error('Generated code does not appear to be valid HTML');
    }

    return code;
  } catch (error) {
    const errorMessage = error.message || error.toString();

    // Check for API key errors
    if (errorMessage.includes('API key') || errorMessage.includes('INVALID_ARGUMENT')) {
      throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }

    // Check for rate limit errors (429, RESOURCE_EXHAUSTED, quota exceeded)
    if (
      errorMessage.includes('429') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('too many requests')
    ) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }

    // Check for permission/authentication errors
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('UNAUTHENTICATED')) {
      throw new Error('Authentication failed. Please check your API key in Settings.');
    }

    throw new Error(`Failed to generate code: ${errorMessage}`);
  }
};

