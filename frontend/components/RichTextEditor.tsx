// components/RichTextEditor.tsx
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
} from 'lucide-react';
import { useTiptapEditor } from '@/hooks/useTiptapEditor'; // We'll create this hook

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editor = useTiptapEditor(value, onChange);

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

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-3 space-y-2">
        {/* First Row - Basic Formatting */}
        <div className="flex flex-wrap gap-1">
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
            <span className="px-2 text-sm text-gray-600 border-l border-r border-gray-300">
              Font
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

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
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

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-700'
            }`}
            title="Align Justify"
          >
            <AlignJustify className="w-4 h-4" />
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

          {/* Color Picker */}
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-8 h-8 p-1 rounded border border-gray-300 cursor-pointer"
            title="Text Color"
          />

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
      </div>
      
      {/* Editor Content */}
      <div className="min-h-64 max-h-96 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none p-4 focus:outline-none min-h-64"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;