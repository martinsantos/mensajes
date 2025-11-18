import React, { useEffect, useRef } from 'react';

// Quill is loaded from a script tag in index.html, so it's available on the window object.
declare var Quill: any;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Quill only once
    if (editorRef.current && !quillInstanceRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ]
        },
        placeholder: 'Write your article content here...',
      });

      // Set initial content from prop
      if (value) {
          quill.clipboard.dangerouslyPasteHTML(value);
      }

      // Listen for changes made by the user
      quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') {
          let html = quill.root.innerHTML;
          // Quill considers an empty editor to be '<p><br></p>'
          if (html === '<p><br></p>') {
            html = '';
          }
          onChange(html);
        }
      });

      quillInstanceRef.current = quill;
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Sync editor with external value changes (e.g., from scraping)
  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (quill) {
      const editorHTML = quill.root.innerHTML;
      const normalizedValue = value || '';
      const normalizedEditorHTML = editorHTML === '<p><br></p>' ? '' : editorHTML;

      // Update editor only if the content is truly different
      if (normalizedValue !== normalizedEditorHTML) {
        // This check helps prevent an infinite loop where a change event
        // triggers a state update, which then re-triggers this effect.
        // We only want to update if the 'value' prop changes externally.
        quill.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value]);

  return (
    // The container for the Quill editor. Quill requires a specific structure.
    // The editor itself will be created inside this div. We add a border to match other inputs.
    <div className="border border-gray-300 rounded-lg">
      <div ref={editorRef} style={{ minHeight: '250px' }} />
    </div>
  );
};

export default RichTextEditor;
