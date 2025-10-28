import { GoogleGenerativeModel } from '@google/generative-ai';
import { validateInput, validateApiKey } from '../../utils/errorHandler';

// NOTE: The GoogleGenerativeAI class is the entry point, but for server-side
// use where you just need the model, you can optimize.
// Let's stick to your original SDK entry point for consistency.
import { GoogleGenAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an AI no-code application builder. The user will provide a high-level request for a simple web application (like a calculator, to-do list, timer, weather widget, or dashboard). You must respond ONLY with the complete, fully functional HTML, CSS, and JavaScript code for a single-file application.

CRITICAL REQUIREMENTS:
1. Output ONLY valid HTML code - nothing else, no explanations or markdown
2. Start with <!DOCTYPE html> and include complete <html> structure
3. Include all CSS within <style> tags in the <head>
4. Include all JavaScript within <script> tags before </body>
5. Use Tailwind CSS (included via CDN <script src="https://cdn.tailwindcss.com"></script>) for styling.
6. Make the application fully functional and interactive
7. Ensure responsive design that works on mobile and desktop
8. Use a clean, professional, visually appealing design with rounded corners and good spacing. Use the Inter font family.
9. Include proper error handling and user feedback (e.g., show messages on the page, not with alert())
10. The code must be complete, runnable, and ready to display in an iframe immediately
11. Do NOT include any explanations, comments outside code, or markdown formatting
12. Do NOT use external APIs or dependencies beyond Tailwind and what's available in the browser

The output must be production-ready HTML that can run standalone in a browser iframe.`;

/**
 * Sleep utility for delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      reject(
        new Error(`Request timeout: No response from AI model after ${ms}ms`)
      );
    }, ms);
  });
};

/**
 * This is your original function, now modified to run on the server
 * and read the API key from environment variables for security.
 */
const generateAppCode = async (description, retryAttempt = 0, maxRetries = 3) => {
  try {
    // 1. Get API key securely from environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Validate inputs (description from user, key from server)
    const validatedApiKey = validateApiKey(apiKey);
    const validatedDescription = validateInput(description);

    // Use a valid and current model
    const MODEL = 'gemini-1.5-flash-latest';
    console.log(`Initializing Gemini AI with model: ${MODEL}`);

    // Correctly initialize the Web SDK client
    const genAI = new GoogleGenAI(validatedApiKey);

    // Get the model and apply the system prompt
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log('Model initialized successfully');

    console.log('Sending request to Gemini API...');
    // Set a 60-second timeout for the API call
    const timeoutMs = 60000;

    // Define the generation request
    const generationRequest = {
      contents: [{ role: 'user', parts: [{ text: validatedDescription }] }],
      generationConfig: {
        temperature: 0.1, // Lower temperature for more deterministic, consistent code
      },
    };

    // Use the modern 'generateContent' method
    const generationPromise = model.generateContent(generationRequest);

    // Race the API call against the timeout
    const result = await Promise.race([
      generationPromise,
      createTimeoutPromise(timeoutMs),
    ]);
    console.log('Received response from Gemini API.');

    // Check if response exists (new SDK structure)
    if (!result || !result.response) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response from AI model: missing response object');
    }

    // Extract text from response (new SDK method)
    let text;
    try {
      text = result.response.text(); // Correct way to get text
      if (!text) {
        throw new Error('No text content in response');
      }
    } catch (textError) {
      console.error('Error extracting text from response:', textError);
      console.error('Response object:', result.response);
      throw new Error(
        `Failed to extract text from response: ${textError.message}`
      );
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
        // Note: We only pass description, retry counts up
        return generateAppCode(description, retryAttempt + 1, maxRetries);
      } else {
        throw new Error('Rate limit exceeded. Please wait a few seconds and try again.');
      }
    }

    // Check for permission/authentication errors
    if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('UNAUTHENTICATED') || errorMessage.includes('403')) {
      throw new Error('Authentication failed. Please check your API key in Settings.');
    }

    // Throw a more generic error for the frontend
    console.error(`Full error: ${errorMessage}`);
    throw new Error(`Failed to generate code. Please try again.`);
  }
};

// This is the Next.js API route handler that uses your function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'No description provided.' });
  }

  try {
    const code = await generateAppCode(description);
    return res.status(200).json({ code: code });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
  }
}
