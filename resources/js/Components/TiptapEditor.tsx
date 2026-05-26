import { appendCsrfToFormData, getCsrfHeaders, handleCsrfError, isCsrfError, refreshCsrfCookie } from '@/lib/csrf';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Paperclip,
    Quote,
    Redo,
    Smile,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Type,
    Underline as UnderlineIcon,
    Undo,
    Youtube as YoutubeIcon,
} from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import MediaLibraryPicker from '@/Components/MediaLibraryPicker';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const TEXT_COLORS = ['#111827', '#4b5563', '#ef4444', '#f59e0b', '#16a34a', '#3b82f6', '#7c3aed', '#ec4899'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bfdbfe', '#fecaca', '#bbf7d0', '#fde68a', '#e9d5ff', '#fbcfe8'];

export default function TiptapEditor({ value, onChange, placeholder, className = '' }: TiptapEditorProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [textCustomColor, setTextCustomColor] = useState('#111827');
    const [highlightCustomColor, setHighlightCustomColor] = useState('#fef08a');
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-[300px] w-auto h-auto my-3 inline-block mx-1',
                },
                allowBase64: true,
                inline: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Commencez a ecrire...',
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Subscript,
            Superscript,
        ],
        content: value,
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-4',
            },
        },
    });

    const uploadFile = useCallback(async (file: File) => {
        const createFormData = () => {
            const formData = new FormData();
            formData.append('file', file);
            appendCsrfToFormData(formData);
            return formData;
        };

        const executeUpload = (formData: FormData) => {
            return fetch(route('dashboard.media.store', undefined, false), {
                method: 'POST',
                headers: getCsrfHeaders(),
                body: formData,
                credentials: 'same-origin',
            });
        };

        try {
            let response = await executeUpload(createFormData());

            if (isCsrfError(response.status)) {
                await refreshCsrfCookie();
                response = await executeUpload(createFormData());

                if (isCsrfError(response.status)) {
                    handleCsrfError();
                    return null;
                }
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Upload failed');
            }

            const url = data?.asset?.url;
            if (!url) {
                throw new Error('URL upload introuvable');
            }

            return { url, name: file.name };
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Erreur lors de l\'upload');
            return null;
        }
    }, []);

    if (!editor) return null;

    const addFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
        input.onchange = async () => {
            if (!input.files?.length) return;
            const file = input.files[0];
            const result = await uploadFile(file);
            if (result) {
                editor.chain().focus().setLink({ href: result.url }).insertContent(file.name).run();
            }
        };
        input.click();
    };

    const addYoutubeVideo = () => {
        const url = prompt('Entrez l\'URL de la video YouTube');
        if (!url) return;

        editor.commands.setYoutubeVideo({
            src: url,
            width: 640,
            height: 480,
        });
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        editor.chain().focus().insertContent(emojiData.emoji).run();
        setShowEmojiPicker(false);
    };

    const currentTextColor = editor.getAttributes('textStyle').color as string | undefined;
    const currentHighlightColor = editor.getAttributes('highlight').color as string | undefined;

    return (
        <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
            <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold className="h-4 w-4" />} title="Gras" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic className="h-4 w-4" />} title="Italique" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon className="h-4 w-4" />} title="Souligne" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<span className="font-bold line-through">S</span>} title="Barre" />

                    <Popover open={showTextColorPicker} onOpenChange={setShowTextColorPicker}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={`rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${currentTextColor ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600' : 'text-gray-600 dark:text-gray-400'}`}
                                title="Couleur du texte"
                            >
                                <Type className="h-4 w-4" style={{ color: currentTextColor || '#6b7280' }} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 border-gray-200 p-3 dark:border-gray-700" side="bottom" align="start">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Texte</p>
                            <div className="mb-3 flex flex-wrap gap-2">
                                {TEXT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setColor(color).run();
                                            setShowTextColorPicker(false);
                                        }}
                                        className="h-7 w-7 rounded-full border border-gray-200 hover:scale-110 dark:border-white/15"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={textCustomColor}
                                    onChange={(event) => {
                                        const next = event.target.value;
                                        setTextCustomColor(next);
                                        editor.chain().focus().setColor(next).run();
                                    }}
                                    className="h-8 w-10 cursor-pointer rounded border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-gray-900"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowTextColorPicker(false);
                                    }}
                                    icon={<span className="text-[11px] font-bold">Auto</span>}
                                    title="Couleur par defaut"
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover open={showHighlightPicker} onOpenChange={setShowHighlightPicker}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={`rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('highlight') ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600' : 'text-gray-600 dark:text-gray-400'}`}
                                title="Couleur de surbrillance"
                            >
                                <Highlighter className="h-4 w-4" style={{ color: currentHighlightColor || '#6b7280' }} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 border-gray-200 p-3 dark:border-gray-700" side="bottom" align="start">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Surlignage</p>
                            <div className="mb-3 flex flex-wrap gap-2">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().setHighlight({ color }).run();
                                            setShowHighlightPicker(false);
                                        }}
                                        className="h-7 w-7 rounded-full border border-gray-200 hover:scale-110 dark:border-white/15"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={highlightCustomColor}
                                    onChange={(event) => {
                                        const next = event.target.value;
                                        setHighlightCustomColor(next);
                                        editor.chain().focus().setHighlight({ color: next }).run();
                                    }}
                                    className="h-8 w-10 cursor-pointer rounded border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-gray-900"
                                />
                                <ToolbarButton
                                    onClick={() => {
                                        editor.chain().focus().unsetHighlight().run();
                                        setShowHighlightPicker(false);
                                    }}
                                    icon={<span className="text-[11px] font-bold">Auto</span>}
                                    title="Retirer surlignage"
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={<Code className="h-4 w-4" />} title="Code" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} icon={<SuperscriptIcon className="h-4 w-4" />} title="Exposant" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} icon={<SubscriptIcon className="h-4 w-4" />} title="Indice" />
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 className="h-4 w-4" />} title="Titre 1" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="h-4 w-4" />} title="Titre 2" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={<Heading3 className="h-4 w-4" />} title="Titre 3" />
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft className="h-4 w-4" />} title="Aligner a gauche" />
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter className="h-4 w-4" />} title="Centrer" />
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight className="h-4 w-4" />} title="Aligner a droite" />
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} icon={<AlignJustify className="h-4 w-4" />} title="Justifier" />
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List className="h-4 w-4" />} title="Liste a puces" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered className="h-4 w-4" />} title="Liste ordonnee" />
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={<Quote className="h-4 w-4" />} title="Citation" />
                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus className="h-4 w-4" />} title="Separateur" />
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={<LinkIcon className="h-4 w-4" />} title="Lien" />
                    <MediaLibraryPicker
                        buttonLabel="Image"
                        title="Inserer une image"
                        iconOnly
                        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
                    />
                    <ToolbarButton onClick={addFile} icon={<Paperclip className="h-4 w-4" />} title="Fichier" />
                    <ToolbarButton onClick={addYoutubeVideo} icon={<YoutubeIcon className="h-4 w-4" />} title="YouTube" />

                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                            <button type="button" className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700" title="Emoji">
                                <Smile className="h-4 w-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-none p-0 shadow-none" side="bottom" align="start">
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator />

                <div className="flex items-center gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} icon={<Undo className="h-4 w-4" />} title="Annuler" />
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} icon={<Redo className="h-4 w-4" />} title="Retablir" />
                </div>
            </div>

            <EditorContent editor={editor} className="min-h-[400px] bg-white dark:bg-gray-900" />
        </div>
    );
}

function Separator() {
    return <div className="mx-1 h-6 w-px self-center bg-gray-300 dark:bg-gray-600" />;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, disabled, icon, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isActive
                    ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600'
                    : 'text-gray-600 dark:text-gray-400'
            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            title={title}
        >
            {icon}
        </button>
    );
}

