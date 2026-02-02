'use client';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}
export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3',
      },
    },
  });
  if (!editor) return null;
  const buttonClass = (isActive: boolean) => `p-1.5 rounded cursor-pointer hover:bg-gray-200 ${isActive ? 'bg-gray-200 text-green-700' : 'text-gray-600'}`;
  return (
    <div className="border border-gray-300 rounded bg-white focus-within:border-green-700">
      <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Đậm">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Nghiêng">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))} title="Tiêu Đề 1">
          <Heading1 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Tiêu Đề 2">
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Danh Sách">
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Danh Sách Số">
          <ListOrdered size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}