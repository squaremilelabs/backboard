"use client"

import { useEditor, EditorContent, Content, useEditorState, Extension } from "@tiptap/react"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { useEffect } from "react"
import { deepEqual } from "fast-equals"
import { Placeholder } from "@tiptap/extensions"
import { cn } from "~/smui/utils"
import { useDebouncedTypings } from "@/common/utils/use-debounced"

export const TextEditor = ({
  initialContent,
  handleSaveContent,
  saveDelay = 500,
}: {
  initialContent: string | null
  handleSaveContent: (content: string | null) => void
  saveDelay?: number
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: cn(
            "inline-flex items-start gap-4",
            "accent-base-text data-[checked=true]:text-neutral-text data-[checked=true]:line-through",
            "[&_*]:text-md",
            "[&_label]:inline-flex [&_label]:items-center [&_input]:!cursor-pointer",
            "[&_label]:h-20"
          ),
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "flex flex-col !ps-0",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "taskList") return ""
          return "Notes..."
        },
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-neutral-text/50 before:h-0 before:pointer-events-none",
      }),
      Extension.create({
        name: "OverrideKeyboardBehaviors",
        addProseMirrorPlugins() {
          return [
            new Plugin({
              key: new PluginKey("StopTabPropagation"),
              props: {
                handleKeyDown(_view, event) {
                  if (event.key === "Tab") {
                    event.stopPropagation()
                  }
                  return false
                },
              },
            }),
          ]
        },
        addKeyboardShortcuts() {
          return {
            Escape: () => {
              handleSaveContent(editor?.isEmpty ? null : JSON.stringify(editor?.getJSON()))
              return this.editor.commands.blur()
            },
          }
        },
      }),
    ],
    onFocus: ({ editor }) => {
      editor.commands.scrollIntoView()
    },
    onBlur: ({ editor }) => {
      handleSaveContent(editor.isEmpty ? null : JSON.stringify(editor.getJSON()))
    },
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    editorProps: {
      attributes: {
        placeholder: "Notes...",
        spellCheck: "false",
        class: cn([
          "prose text-base-text !outline-0",
          "prose-p:m-0 prose-p:text-md",
          "min-h-120",
          // LIST ITEMS
          "prose-ul:ps-16 prose-li:ps-16",
          "prose-ul:m-0 prose-ol:m-0",
          "prose-li:ps-0",
          "prose-li:m-0",
          "marker:text-base-text marker:text-sm marker:!font-sans",
          // LINKS
          "prose-a:text-primary-text prose-a:font-normal prose-a:cursor-pointer",
          "prose-a:no-underline prose-a:hover:underline",
          // CODE
          "prose-code:font-semibold prose-code:bg-primary-muted-bg",
          "prose-code:px-1 prose-code:py-0.5 prose-code:text-md prose-code:font-mono",
          "prose-code:text-primary-muted-fg prose-code:rounded-sm",
          // HORIZONTAL RULE
          "prose-hr:my-4 prose-hr:border-base-border",
        ]),
      },
    },
  })

  const editorState = useEditorState<{
    isInitialized: boolean
    isFocused: boolean
    isEmpty: boolean
    json: Content | null
  }>({
    editor,
    equalityFn: deepEqual,
    selector: ({ editor: e }) => {
      return {
        isInitialized: e?.isInitialized || false,
        isFocused: e?.isFocused || false,
        isEmpty: e?.isEmpty || false,
        json: e?.getJSON() || null,
      }
    },
  })

  // INITIALIZE EDITOR CONTENT
  useEffect(() => {
    if (editorState?.isInitialized && !editorState?.isFocused) {
      editor?.commands.setContent(parseStringToContent(initialContent || ""))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't rerun every time commands change
  }, [initialContent, editorState?.isInitialized, editorState?.isFocused])

  // HANDLE CHANGED VALUES
  const { setTypedValue, settledValue } = useDebouncedTypings<Content>(null, saveDelay)

  // Sync typed values
  useEffect(() => {
    if (!editorState?.isInitialized) return
    if (!editorState?.isFocused) return
    setTypedValue(editorState?.isEmpty ? null : editorState?.json)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState?.json, editorState?.isEmpty, editorState?.isInitialized, editorState?.isFocused])

  // Save settled value
  useEffect(() => {
    if (!editorState?.isInitialized) return
    if (!editorState?.isFocused) return
    handleSaveContent(settledValue ? JSON.stringify(settledValue) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run this when settledValue change
  }, [settledValue])

  if (!editor) return null
  return <EditorContent editor={editor} />
}

const parseStringToContent = (val: string): Content => {
  try {
    return JSON.parse(val)
  } catch {
    return val
  }
}
