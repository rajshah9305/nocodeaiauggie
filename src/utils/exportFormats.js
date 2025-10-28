/**
 * Export Formats Utility
 * Converts generated HTML code to different framework formats
 */

export const exportFormats = {
  html: (code) => {
    return code;
  },

  react: (code) => {
    // Extract body content from HTML
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : code;

    // Extract style content
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styleContent = styleMatch ? styleMatch[1] : '';

    // Extract script content
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const scriptContent = scriptMatch ? scriptMatch[1] : '';

    return `import React, { useState, useEffect } from 'react';

export default function App() {
  ${scriptContent ? `// Component logic\n  ${scriptContent.replace(/document\./g, 'ref.')}` : ''}

  return (
    <div className="app-container">
      <style>{${JSON.stringify(styleContent)}}</style>
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(bodyContent)} }} />
    </div>
  );
}`;
  },

  vue: (code) => {
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : code;

    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styleContent = styleMatch ? styleMatch[1] : '';

    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const scriptContent = scriptMatch ? scriptMatch[1] : '';

    return `<template>
  <div class="app-container">
    ${bodyContent}
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {};
  },
  mounted() {
    ${scriptContent}
  }
}
</script>

<style scoped>
${styleContent}
</style>`;
  },

  angular: (code) => {
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : code;

    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styleContent = styleMatch ? styleMatch[1] : '';

    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div class="app-container">
      ${bodyContent}
    </div>
  \`,
  styles: [\`
    ${styleContent}
  \`]
})
export class AppComponent {
  constructor() {}

  ngOnInit() {
    // Component initialization
  }
}`;
  },

  javascript: (code) => {
    // Extract just the script content
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const scriptContent = scriptMatch ? scriptMatch[1] : '';

    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styleContent = styleMatch ? styleMatch[1] : '';

    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : code;

    return `// Generated JavaScript Application

// Styles
const styles = \`
${styleContent}
\`;

// HTML Content
const htmlContent = \`
${bodyContent}
\`;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  // Add HTML content
  document.body.innerHTML = htmlContent;

  // Application Logic
  ${scriptContent}
});`;
  },

  typescript: (code) => {
    const jsCode = exportFormats.javascript(code);
    return jsCode.replace(/\/\/ Generated JavaScript/g, '// Generated TypeScript');
  },
};

/**
 * Get file extension for export format
 */
export const getFileExtension = (format) => {
  const extensions = {
    html: 'html',
    react: 'jsx',
    vue: 'vue',
    angular: 'ts',
    javascript: 'js',
    typescript: 'ts',
  };
  return extensions[format] || 'txt';
};

/**
 * Get MIME type for export format
 */
export const getMimeType = (format) => {
  const mimeTypes = {
    html: 'text/html',
    react: 'text/javascript',
    vue: 'text/plain',
    angular: 'text/typescript',
    javascript: 'text/javascript',
    typescript: 'text/typescript',
  };
  return mimeTypes[format] || 'text/plain';
};

/**
 * Download code in specified format
 */
export const downloadCode = (code, format = 'html', filename = 'app') => {
  const formatter = exportFormats[format];
  if (!formatter) {
    throw new Error(`Unknown export format: ${format}`);
  }

  const formattedCode = formatter(code);
  const extension = getFileExtension(format);
  const mimeType = getMimeType(format);

  const blob = new Blob([formattedCode], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy code to clipboard in specified format
 */
export const copyCodeToClipboard = async (code, format = 'html') => {
  const formatter = exportFormats[format];
  if (!formatter) {
    throw new Error(`Unknown export format: ${format}`);
  }

  const formattedCode = formatter(code);
  try {
    await navigator.clipboard.writeText(formattedCode);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

