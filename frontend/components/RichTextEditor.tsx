"use client";

import { EditorContent } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Minus,
  Plus,
  Undo,
  Redo,
  Image as ImageIcon,
  Link,
  Unlink,
} from 'lucide-react';
import { useTiptapEditor } from '@/hooks/useTiptapEditor';
import { useBlog } from '@/contexts/blog-context';
import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const { uploadImage } = useBlog();
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [currentFont, setCurrentFont] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      await insertImage(file);
    };

    input.click();
  };

  const insertImage = async (file: File): Promise<void> => {
    if (!editor) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  
  const handleSetLink = () => {
    if (!editor) return;

    // If there's already a link at cursor, remove it
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Check if text is selected
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // Show URL input for selected text
      setShowLinkInput(true);
      setLinkUrl('');
    } else {
      // No selection - create link with empty text
      const url = window.prompt('Enter URL:');
      if (url) {
        let finalUrl = url.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl;
        }
        // Insert link with placeholder text
        editor.chain().focus().setLink({ href: finalUrl }).insertContent('link').run();
      }
    }
  };

  const confirmLink = () => {
    if (!editor || !linkUrl.trim()) {
      setShowLinkInput(false);
      return;
    }

    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log('Adding link:', url);
    
    // Apply link to selected text
    editor.chain().focus().setLink({ href: url }).run();
    
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl('');
  };

  // Remove link from selected text
  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };


  // NEW APPROACH: Apply font family using CSS variables
  const handleFontFamilyChange = (fontFamily: string) => {
    if (!editor || !editorRef.current) return;

    setCurrentFont(fontFamily);
    
    // Apply font family to the entire editor container
    if (fontFamily === '') {
      editorRef.current.style.setProperty('--editor-font-family', 'inherit');
    } else {
      editorRef.current.style.setProperty('--editor-font-family', fontFamily);
    }

    // Also apply to selected text using TipTap
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      if (fontFamily === '') {
        editor.chain().focus().unsetFontFamily().run();
      } else {
        editor.chain().focus().setFontFamily(fontFamily).run();
      }
    } else {
      // Apply to the current position for new text
      if (fontFamily === '') {
        editor.chain().focus().unsetFontFamily().run();
      } else {
        editor.chain().focus().setFontFamily(fontFamily).run();
      }
    }

    editor.commands.focus();
  };

  const editor = useTiptapEditor({
    content: value,
    onChange,
    onImageUpload: async (file: File) => {
      const imageUrl = await uploadImage(file);
      return imageUrl;
    }
  });

  // Apply initial font
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.setProperty('--editor-font-family', 'inherit');
    }
  }, []);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-xl p-8 h-64 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          Loading editor...
        </div>
      </div>
    );
  }

  
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const increaseFontSize = () => {
    const currentSize = editor.getAttributes('textStyle').fontSize || '16px';
    const newSize = `${parseInt(currentSize) + 2}px`;
    editor.chain().focus().setFontSize(newSize).run();
  };

  const decreaseFontSize = () => {
    const currentSize = editor.getAttributes('textStyle').fontSize || '16px';
    const newSize = `${Math.max(8, parseInt(currentSize) - 2)}px`;
    editor.chain().focus().setFontSize(newSize).run();
  };

  const fontOptions = [
    { value: '', label: 'Default Font' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Courier New", Courier, monospace', label: 'Courier New' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: 'Impact, Haettenschweiler, sans-serif', label: 'Impact' },
    { value: '"Comic Sans MS", cursive, sans-serif', label: 'Comic Sans' },
  ];

  return (
    <div 
      ref={editorRef}
      className="border border-gray-300 rounded-xl overflow-hidden bg-white"
      style={{
        // Apply CSS variable for font family
        fontFamily: 'var(--editor-font-family, inherit)'
      }}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-3 space-y-2">
        {/* First Row - Font Controls */}
        <div className="flex flex-wrap gap-1">
          {/* Font Family Selector */}
          <select
            value={currentFont}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 min-w-[160px]"
            title="Font Family"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
            <button
              type="button"
              onClick={decreaseFontSize}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Decrease Font Size"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm text-gray-600 border-l border-r border-gray-300 min-w-[40px] text-center">
              {editor.getAttributes('textStyle').fontSize || '16px'}
            </span>
            <button
              type="button"
              onClick={increaseFontSize}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Increase Font Size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={isUploading}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
            }`}
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Link Button */}
          <button
            type="button"
            onClick={handleSetLink}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Add Link"
          >
            <Link className="w-4 h-4" />
          </button>

          {/* Color Picker */}
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-8 h-8 p-1 rounded border border-gray-300 cursor-pointer"
            title="Text Color"
          />
        </div>

        {/* Second Row - Advanced Formatting */}
        <div className="flex flex-wrap gap-1">
          {/* Headings */}
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else if (value.startsWith('h')) {
                const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="p-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700"
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Text Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={addTable}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-gray-500 italic">
          💡 Tip: Select text first, then choose a font to apply it to your selection
        </div>
      </div>
      
      {/* Link Input Dialog */}
      {showLinkInput && (
        <div className="border-b border-gray-300 bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL (https://...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmLink();
                if (e.key === 'Escape') cancelLink();
              }}
              autoFocus
            />
            <button
              onClick={confirmLink}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Add
            </button>
            <button
              onClick={cancelLink}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="min-h-64 max-h-96 overflow-y-auto relative">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none p-4 focus:outline-none min-h-64"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="border-t border-gray-200 p-2 bg-gray-50 text-xs text-gray-500">
        <div>Current Font: {currentFont || 'Default'}</div>
        <div>Font Size: {editor.getAttributes('textStyle').fontSize || '16px'}</div>
        <div>Selected Text: {editor.state.selection.empty ? 'None' : 'Text Selected'}</div>
      </div>
    </div>
  );
};

export default RichTextEditor;