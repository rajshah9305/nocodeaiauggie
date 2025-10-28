import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateInput, validateApiKey } from '../utils/errorHandler';

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
  // e.g., 1s, 2s, 4s, 8s...
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
 * Creates a promise that rejects if the AbortSignal is triggered.
 * @param {AbortSignal | null} signal - The abort signal
 * @returns {Promise<never>}
 */
const createAbortPromise = (signal) => {
  return new Promise((_, reject) => {
    if (!signal) return; // Do nothing if no signal is provided
    if (signal.aborted) {
      return reject(new Error('Request aborted by user.'));
    }
    signal.addEventListener('abort', () => {
      reject(new Error('Request aborted by user.'));
    });
  });
};


/**
 * Generate application code using Google Gemini API
 * @param {string} description - User's description of the app to generate
 * @param {string} apiKey - Google Gemini API key
 * @param {object} [options={}] - Optional configuration
 * @param {number} [options.maxRetries=3] - Maximum number of retries
 * @param {number} [options.timeoutMs=60000] - Request timeout in milliseconds
 * @param {string} [options.modelName='gemini-1.5-flash-latest'] - The model to use
 * @param {AbortSignal | null} [abortSignal=null] - An optional AbortSignal to cancel the request
 * @param {number} [retryAttempt=0] - Internal retry counter
 * @returns {Promise<string>} Generated HTML code
 */
export const generateAppCode = async (
  description,
  apiKey,
  options = {},
  abortSignal = null,
  retryAttempt = 0
) => {
  // Destructure options with defaults
  const {
    maxRetries = 3,
    timeoutMs = 60000,
    modelName = 'gemini-1.5-flash-latest'
  } = options;

  try {
    // Validate inputs
    const validatedApiKey = validateApiKey(apiKey);
    const validatedDescription = validateInput(description);

    // Use the configurable model name
    console.log(`Initializing Gemini AI with model: ${modelName}`);

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(validatedApiKey);

    // Get the model with system instruction
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });
    console.log('Model initialized successfully');

    console.log(`Sending request to Gemini API... (Attempt ${retryAttempt + 1})`);
    
    // Create the generation request
    const generationPromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: validatedDescription }] }],
      generationConfig: {
        temperature: 0.1, // Lower temperature for more deterministic code
        maxOutputTokens: 8192, // Max tokens for 1.5 flash
      },
    });

    // Race the API call against the timeout and an external abort signal
    const result = await Promise.race([
      generationPromise,
      createTimeoutPromise(timeoutMs),
      createAbortPromise(abortSignal),
    ]);
    console.log('Received response from Gemini API.');

    // Check if response exists
    if (!result || !result.response) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response from AI model: missing response object');
    }

    // Extract text from response
    let text;
    try {
      text = result.response.text();
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
    let code = text.trim();
    if (code.startsWith('```html')) {
      code = code.substring(7); // Remove ```html
      if (code.endsWith('```')) {
        code = code.substring(0, code.length - 3); // Remove trailing ```
      }
    } else if (code.startsWith('```')) {
      code = code.substring(3); // Remove ```
      if (code.endsWith('```')) {
        code = code.substring(0, code.length - 3); // Remove trailing ```
      }
    }

    code = code.trim(); // Final trim

    // Validate that we have HTML
    const lowerCaseCode = code.toLowerCase();
    if (!lowerCaseCode.startsWith('<!doctype html>')) {
      console.warn('Response does not start with <!DOCTYPE html>. Attempting to fix.');
      // Sometimes the model might add a prefix
      const htmlStartIndex = lowerCaseCode.indexOf('<!doctype html>');
      if (htmlStartIndex !== -1) {
        code = code.substring(htmlStartIndex);
      } else {
        // If still not found, throw an error
        console.error('Generated code does not appear to be valid HTML (missing <!DOCTYPE>):', code);
        throw new Error('Generated code does not appear to be valid HTML: Missing <!DOCTYPE html>');
      }
    }
    
    // More "elite" validation
    if (!lowerCaseCode.includes('<html')) {
         throw new Error('Generated code is missing <html> tag.');
    }
    if (!lowerCaseCode.includes('<body>')) {
         throw new Error('Generated code is missing <body> tag.');
    }


    console.log('Successfully generated and cleaned code');
    return code;
    
  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.error(`Error in generateAppCode (Attempt ${retryAttempt + 1}):`, errorMessage);

    // Check for user-triggered abort
    if (errorMessage.includes('aborted by user')) {
      throw new Error('Code generation was canceled.');
    }

    // Check for API key errors
    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('INVALID_ARGUMENT') ||
      errorMessage.includes('401')
    ) {
      throw new Error(
        'Invalid API key. Please check your Gemini API key in Settings.'
      );
    }

    // Handle rate limit errors with automatic retry
    if (isRateLimitError(error)) {
      if (retryAttempt < maxRetries) {
        const delay = getRetryDelay(retryAttempt);
        console.log(
          `Rate limit hit. Retrying in ${delay}ms... (Attempt ${retryAttempt + 1}/${maxRetries})`
        );
        await sleep(delay);
        return generateAppCode(
          description,
          apiKey,
          options, // Pass options object through
          abortSignal, // Pass signal through
          retryAttempt + 1
        );
      } else {
        throw new Error(
          'Rate limit exceeded. Please wait a few seconds and try again.'
        );
      }
    }

    // Check for permission/authentication errors
    if (
      errorMessage.includes('PERMISSION_DENIED') ||
      errorMessage.includes('UNAUTHENTICATED') ||
      errorMessage.includes('403')
    ) {
      throw new Error(
        'Authentication failed. Please check your API key in Settings.'
      );
    }

    // Check for network errors
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      throw new Error(
        'Network error. Please check your internet connection and try again.'
      );
    }
    
    // Throw a more user-friendly general error
    throw new Error(
      `Failed to generate code: ${errorMessage}. Please try again.`
    );
  }
};

