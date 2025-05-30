import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading'; 
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';


const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const buttonStyle = (active) =>
    `px-2 py-1 border rounded text-sm ${
      active ? 'bg-black text-white' : 'bg-white text-black'
    }`;

  const addImage = () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        editor.chain().focus().setImage({ src: `http://localhost:3001${data.url}` }).run();
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
        alert("Не удалось загрузить изображение.");
      }
    }
  };

  fileInput.click();
};


  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button type="button" className={buttonStyle(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>Жирный</button>
      <button type="button" className={buttonStyle(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>Курсив</button>
      <button type="button" className={buttonStyle(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>Подчёркнутый</button>
      <button type="button" className={buttonStyle(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
      <button type="button" className={buttonStyle(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" className={buttonStyle(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Список</button>
      <button type="button" className={buttonStyle(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Список</button>
      <button type="button" className={buttonStyle(editor.isActive('link'))} onClick={() => {
        const url = prompt('Введите URL ссылки');
        if (url) {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
      }}>Ссылка</button>
      <button type="button" className={buttonStyle(false)} onClick={addImage}>Картинка</button>
    </div>
  );
};

const Editor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // 👇 добавь этот эффект
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-base font-inter transition placeholder:text-gray-400">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
