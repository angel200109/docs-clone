"use client";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { FontSizeExtension } from "@/app/extensions/font-size";
import { LineHeightExtension } from "@/app/extensions/line-height";
import { useEditorState } from "@/store/use-editor-store";
import { Ruler } from "./ruler";
import { Threads } from "./threads";
import { useStorage } from "@liveblocks/react/suspense";
import { LEFT_MARGIN_DEFUALT, RIGHT_MARGIN_DEFUALT } from "@/constants/margin";

interface EditorProps {
  initialContent?: string | undefined;
}

const Editor = ({ initialContent }: EditorProps) => {
  const leftMargin = useStorage((root) => root.leftMargin);
  const rightMargin = useStorage((root) => root.rightMargin);
  const liveblocks = useLiveblocksExtension({
    initialContent,
    offlineSupport_experimental: true
  });
  const { setEditor } = useEditorState();

  // useEditor 是 Tiptap 提供的 React Hook，用于 --> 创建编辑器实例
  const editor = useEditor({
    autofocus: true,
    immediatelyRender: false,
    onCreate({ editor }) {
      setEditor(editor);
    },
    onDestroy() {
      setEditor(null);
    },
    onUpdate({ editor }) {
      setEditor(editor);
    },
    onSelectionUpdate({ editor }) {
      setEditor(editor);
    },
    onTransaction({ editor }) {
      setEditor(editor);
    },
    onFocus({ editor }) {
      setEditor(editor);
    },
    onBlur({ editor }) {
      setEditor(editor);
    },
    onContentError({ editor }) {
      setEditor(editor);
    },

    editorProps: {
      // 直接映射到编辑区域的属性（DOM props）
      attributes: {
        style: `padding-left:${leftMargin ?? LEFT_MARGIN_DEFUALT}px;padding-right:${rightMargin ?? RIGHT_MARGIN_DEFUALT}px`, // 内联样式
        // 类名
        class:
          "focus:outline-none bg-white border border-[#C7C7C7] print:border-0 flex flex-col min-h-[1054px] w-[816px] pt-5 pr-14 pb-10 cursor-text",
      },
    },
    extensions: [
      liveblocks,
      StarterKit.configure({
        history: false
      }),
      LineHeightExtension.configure({
        types: ["heading", "paragraph"],
        defaultLineHeight: "normal",
      }),
      FontSizeExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Color,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontFamily,
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      ImageResize,
    ], // 基础编辑器功能集合
    content: "<p>Hello World! 🌎️</p>",
  });

  return (
    <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible ">
      <Ruler />
      <div className="min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
        <EditorContent editor={editor} />
        <Threads editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
