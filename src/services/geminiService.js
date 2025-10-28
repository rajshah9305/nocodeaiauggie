import { GoogleGenAI } from '@google/genai';
import { validateInput, validateApiKey } from '../utils/errorHandler';

const SYSTEM_PROMPT = `You are an AI no-code application builder. The user will provide a high-level request for a simple web application (like a calculator, to-do list, timer, weather widget, or dashboard). You must respond ONLY with the complete, fully functional HTML, CSS, and JavaScript code for a single-file application.

CRITICAL REQUIREMENTS:
1. Output ONLY valid HTML code - nothing else, no explanations or markdown
2. Start with <!DOCTYPE html> and include complete <html> structure
3. Include all CSS within <style> tags in the <head>
4. Include all JavaScript within <script> tags before </body>
5. Use Tailwind CSS (included via CDN) for styling when possible
6. Make the application fully functional and interactive
7. Ensure responsive design that works on mobile and desktop
8. Use a clean, professional, visually appealing design
9. Include proper error handling and user feedback
10. The code must be complete, runnable, and ready to display in an iframe immediately
11. Do NOT include any explanations, comments outside code, or markdown formatting
12. Do NOT use external APIs or dependencies beyond what's available in the browser

The output must be production-ready HTML that can run standalone in a browser iframe.`;

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is a rate limit error
 */
const isRateLimitError = (error) => {
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('too many requests')
  );
};

/**
 * Get retry delay based on attempt number (exponential backoff)
 */
const getRetryDelay = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
};

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
const createTimeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout: No response from AI model after ${ms}ms`));
    }, ms);
  });
};

export const generateAppCode = async (description, apiKey, retryAttempt = 0, maxRetries = 3) => {
  try {
    // Validate inputs
    const validatedApiKey = validateApiKey(apiKey);
    const validatedDescription = validateInput(description);

    // Use the latest Gemini model with better code generation
    const MODEL = 'gemini-2.5-flash-preview-09-2025';
    console.log(`Initializing Gemini AI with model: ${MODEL}`);
    const client = new GoogleGenAI({ apiKey: validatedApiKey });
    console.log('Model initialized successfully');

    const prompt = `${SYSTEM_PROMPT}

User Request: ${validatedDescription}`;

    console.log('Sending prompt to Gemini API...');
    // Set a 60-second timeout for the API call
    const timeoutMs = 60000;
    const response = await Promise.race([
      client.models.generateContent({
        model: MODEL,
        contents: prompt,
        generationConfig: {
          temperature: 0.1, // Lower temperature for more deterministic, consistent code
        },
      }),
      createTimeoutPromise(timeoutMs)
    ]);
    console.log('Received response from Gemini API:', response);

    // Check if response exists
    if (!response) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid response from AI model: missing response object');
    }

    // Extract text from response
    let text;
    try {
      text = response.text;
      if (!text) {
        throw new Error('No text content in response');
      }
    } catch (textError) {
      console.error('Error extracting text from response:', textError);
      console.error('Response object:', response);
      throw new Error(`Failed to extract text from response: ${textError.message}`);
    }

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
    if (errorMessage.includes('API key') || errorMessage.includes('INVALID_ARGUMENT') || errorMessage.includes('401')) {
      throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }

    // Handle rate limit errors with automatic retry
    if (isRateLimitError(error)) {
      if (retryAttempt < maxRetries) {
        const delay = getRetryDelay(retryAttempt);
        console.log(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retryAttempt + 1}/${maxRetries})`);

        // Wait before retrying
        await sleep(delay);

        // Retry the request
        return generateAppCode(description, apiKey, retryAttempt + 1, maxRetries);
      } else {
        throw new Error('Rate limit exceeded. Please wait a few seconds and try again.');
      }
    }

    // Check for permission/authentication errors
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('UNAUTHENTICATED') || errorMessage.includes('403')) {
      throw new Error('Authentication failed. Please check your API key in Settings.');
    }

    throw new Error(`Failed to generate code: ${errorMessage}`);
  }
};

