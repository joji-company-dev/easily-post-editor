import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import ToolbarPlugin from "./ToolbarPlugin";
import { EditorState, LexicalEditor } from "lexical";
import { forwardRef } from "react";
import { ImageNode } from "../../lexical/nodes/ImageNode";
import ImagesPlugin from "../../lexical/plugins/ImagePlugin";
import { cn } from "../../utils/cn";

import "./style.css";

const theme = {
  // Theme styling goes here
  //...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

export interface CommunityPostEditorProps {
  /**
   * @description 이즐리 api로부터 전달받은 게시글 데이터 객체를 담습니다.
   */
  initialContent?: Record<string, any>;
  /**
   * @description 읽기 전용 모드 여부를 담습니다. 게시글을 보여주는 목적으로 사용할 경우에는 true로 설정합니다.
   */
  isReadOnly?: boolean;
  /**
   * @description 컴포넌트 컨테이너에 적용할 클래스 이름입니다.
   */
  containerClassName?: string;
  /**
   * @description 게시글 내용이 변경될 때 호출되는 함수입니다. isReadOnly가 true일 때는 불필요합니다.
   */
  onChange?: (editorState: EditorState) => void;
  /**
   * @description 이미지 업로드가 일어날 때 호출되는 함수입니다. isReadOnly가 true일 때는 불필요합니다.
   */
  onUploadImage?: (file: File) => Promise<string | null>;
}

export const CommunityPostEditor = forwardRef<
  LexicalEditor,
  CommunityPostEditorProps
>(
  (
    {
      isReadOnly = false,
      initialContent,
      onChange = () => {},
      onUploadImage,
      containerClassName: className,
    },
    ref
  ) => {
    const initialConfig: InitialConfigType = {
      namespace: "MyEditor",
      theme,
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        ImageNode,
      ],
      editable: !isReadOnly,
      editorState: (state) => {
        if (!initialContent) {
          return state;
        }
        const parsedState = state.parseEditorState(initialContent as any);
        state.setEditorState(parsedState);
        return parsedState;
      },
      onError,
    };

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={cn(
            "editor-container w-full border flex-1 flex flex-col",
            isReadOnly && "readonly",
            className
          )}
        >
          {!isReadOnly && <ToolbarPlugin onUploadImage={onUploadImage} />}
          <div className="editor-inner h-full">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  disabled={isReadOnly}
                  className={cn(
                    "h-full outline-primary p-2 w-full",
                    isReadOnly && "readonly"
                  )}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin />
            <AutoLinkPlugin matchers={MATCHERS} />
            <ListPlugin />
            <ImagesPlugin />
            <EditorRefPlugin
              editorRef={(editor) => {
                if (ref) {
                  if (typeof ref === "function") {
                    ref(editor);
                  } else {
                    ref.current = editor;
                  }
                }
              }}
            />
            <OnChangePlugin onChange={onChange} />
          </div>
        </div>
      </LexicalComposer>
    );
  }
);

CommunityPostEditor.displayName = "CommunityPostEditor";

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
      // attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
    };
  },
];
