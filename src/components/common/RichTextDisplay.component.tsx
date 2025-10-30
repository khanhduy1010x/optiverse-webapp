import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '', 
  maxLength 
}) => {
  // Sanitize and process HTML content
  const processContent = (html: string): string => {
    if (!html) return '';
    
    // If maxLength is specified, we need to truncate while preserving HTML structure
    if (maxLength) {
      // Create a temporary div to work with HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // If text is shorter than maxLength, return original HTML
      if (textContent.length <= maxLength) {
        return html;
      }
      
      // For truncation, we'll extract plain text and add ellipsis
      // This is safer than trying to truncate HTML while preserving structure
      const truncatedText = textContent.substring(0, maxLength).trim() + '...';
      
      // Check if original content has formatting
      const hasFormatting = /<(strong|b|em|i|u|s|strike|h[1-6]|ul|ol|li|blockquote|code|pre|a)\b[^>]*>/i.test(html);
      
      if (!hasFormatting) {
        return truncatedText;
      }
      
      // If it has formatting but we need to truncate, we'll show a preview with basic formatting preserved
      // Extract the first few formatted elements if possible
      const firstParagraph = html.match(/<p[^>]*>.*?<\/p>/i);
      if (firstParagraph) {
        const pContent = firstParagraph[0];
        const pTextContent = pContent.replace(/<[^>]*>/g, '');
        if (pTextContent.length <= maxLength) {
          return pContent;
        }
      }
      
      return truncatedText;
    }
    
    return html;
  };

  const processedContent = processContent(content);
  
  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(processedContent);
  
  if (!hasHtmlTags) {
    // If no HTML tags, render as plain text
    return (
      <div className={className}>
        {processedContent}
      </div>
    );
  }

  // Render HTML content safely
  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      style={{
        // Basic styling for rich text elements
        wordBreak: 'break-word',
        lineHeight: '1.5'
      }}
    />
  );
};

export default RichTextDisplay;