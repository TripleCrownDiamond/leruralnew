import { useEditor, EditorContent } from '@tiptap/react';
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
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    List, 
    ListOrdered, 
    Quote, 
    Undo, 
    Redo, 
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Minus,
    Smile,
    Youtube as YoutubeIcon,
    Paperclip,
    Highlighter,
    Type,
    Code,
    Superscript as SuperscriptIcon,
    Subscript as SubscriptIcon
} from 'lucide-react';
import { useCallback, useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import ImageCropper from '@/Components/ImageCropper';

// Configuration Cloudinary
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lerural'; 
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'lerural';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

const lowlight = createLowlight(common);

interface TiptapEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const COLORS = [
    { name: 'Noir', value: '#000000' },
    { name: 'Gris', value: '#666666' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Violet', value: '#8B5CF6' },
];

export default function TiptapEditor({ value, onChange, placeholder, className = "" }: TiptapEditorProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<File | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // We configure it manually
                codeBlock: false, // We use lowlight
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
                    class: 'rounded-lg max-w-full h-auto my-4 inline-block mx-1',
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
                placeholder: placeholder || 'Commencez à écrire...',
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
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-4',
            },
        },
    });

    const uploadFile = useCallback(async (file: File, type: 'image' | 'raw' = 'image') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        if (API_KEY) {
            formData.append('api_key', API_KEY);
        }

        try {
            const endpoint = type === 'image' ? 'image' : 'raw';
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                return { url: data.secure_url, name: data.original_filename };
            }
            throw new Error(data.error?.message || 'Upload failed');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Erreur lors de l\'upload');
            return null;
        }
    }, []);

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            if (e.target.files?.length) {
                const file = e.target.files[0];
                setImageToCrop(file);
                setShowCropper(true);
            }
        };
        input.click();
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!imageToCrop) return;
        const file = new File([croppedBlob], imageToCrop.name, { type: 'image/jpeg' });
        const result = await uploadFile(file, 'image');
        if (result) {
            editor?.chain().focus().setImage({ src: result.url }).run();
        }
        setShowCropper(false);
        setImageToCrop(null);
    };

    const addFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                const result = await uploadFile(file, 'raw');
                if (result) {
                    editor.chain().focus().setLink({ href: result.url }).insertContent(file.name).run();
                }
            }
        };
        input.click();
    };

    const addYoutubeVideo = () => {
        const url = prompt('Entrez l\'URL de la vidéo YouTube');

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            });
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

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

    return (
        <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm ${className}`}>
            <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
                {/* Text Formatting */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={<Bold className="h-4 w-4" />}
                        title="Gras"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={<Italic className="h-4 w-4" />}
                        title="Italique"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        icon={<UnderlineIcon className="h-4 w-4" />}
                        title="Souligné"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon={<span className="line-through font-bold">S</span>}
                        title="Barré"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        icon={<Highlighter className="h-4 w-4" />}
                        title="Surligner"
                    />
                    
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                                    editor.getAttributes('textStyle').color 
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}
                                title="Couleur du texte"
                            >
                                <Type className="h-4 w-4" style={{ color: editor.getAttributes('textStyle').color }} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-auto border-gray-200 dark:border-gray-700" side="bottom" align="start">
                            <div className="flex gap-1 flex-wrap w-40">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color.value).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                                <button
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Par défaut"
                                >
                                    Auto
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* Advanced Text */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        icon={<Code className="h-4 w-4" />}
                        title="Code"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        icon={<SuperscriptIcon className="h-4 w-4" />}
                        title="Exposant"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        icon={<SubscriptIcon className="h-4 w-4" />}
                        title="Indice"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* Headings */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon={<Heading1 className="h-4 w-4" />}
                        title="Titre 1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={<Heading2 className="h-4 w-4" />}
                        title="Titre 2"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        icon={<Heading3 className="h-4 w-4" />}
                        title="Titre 3"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* Alignment */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        icon={<AlignLeft className="h-4 w-4" />}
                        title="Aligner à gauche"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        icon={<AlignCenter className="h-4 w-4" />}
                        title="Centrer"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        icon={<AlignRight className="h-4 w-4" />}
                        title="Aligner à droite"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        icon={<AlignJustify className="h-4 w-4" />}
                        title="Justifier"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* Lists & Blocks */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={<List className="h-4 w-4" />}
                        title="Liste à puces"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={<ListOrdered className="h-4 w-4" />}
                        title="Liste ordonnée"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon={<Quote className="h-4 w-4" />}
                        title="Citation"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        icon={<Minus className="h-4 w-4" />}
                        title="Séparateur horizontal"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* Media & Inserts */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        icon={<LinkIcon className="h-4 w-4" />}
                        title="Lien"
                    />
                    <ToolbarButton
                        onClick={addImage}
                        icon={<ImageIcon className="h-4 w-4" />}
                        title="Image"
                    />
                    <ToolbarButton
                        onClick={addFile}
                        icon={<Paperclip className="h-4 w-4" />}
                        title="Joindre un fichier"
                    />
                    <ToolbarButton
                        onClick={addYoutubeVideo}
                        icon={<YoutubeIcon className="h-4 w-4" />}
                        title="Vidéo YouTube"
                    />
                    
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                                title="Emoji"
                            >
                                <Smile className="h-4 w-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto border-none shadow-none" side="bottom" align="start">
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>

                {/* History */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        icon={<Undo className="h-4 w-4" />}
                        title="Annuler"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        icon={<Redo className="h-4 w-4" />}
                        title="Rétablir"
                    />
                </div>
            </div>
            <EditorContent editor={editor} className="bg-white dark:bg-gray-900 min-h-[400px]" />
            
            <ImageCropper 
                open={showCropper} 
                onOpenChange={setShowCropper} 
                imageFile={imageToCrop} 
                onCropComplete={handleCropComplete} 
            />
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: React.ReactNode;
    title: string;
}

function ToolbarButton({ onClick, isActive, disabled, icon, title }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                isActive 
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                    : 'text-gray-600 dark:text-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
        >
            {icon}
        </button>
    );
}