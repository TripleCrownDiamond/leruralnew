import { useForm, usePage } from '@inertiajs/react';
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import axios from 'axios';

interface Comment {
    id: number;
    author_name: string;
    content: string;
    created_at_human: string;
    likes_count: number;
    is_liked: boolean;
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    articleId: number;
    depth?: number;
}

export default function CommentItem({ comment, articleId, depth = 0 }: CommentItemProps) {
    const { props } = usePage<any>();
    const auth = props.auth?.user;
    
    const [likesCount, setLikesCount] = useState(comment.likes_count);
    const [isLiked, setIsLiked] = useState(comment.is_liked);
    const [isReplying, setIsReplying] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        content: '',
        author_name: auth ? auth.name : '',
        author_email: auth ? auth.email : '',
        rating: 5,
        parent_id: comment.id,
    });

    const handleLike = async () => {
        const prevLiked = isLiked;
        const prevCount = likesCount;

        setIsLiked(!prevLiked);
        setLikesCount(prevCount + (!prevLiked ? 1 : -1));

        try {
            await axios.post(`/comments/${comment.id}/like`);
        } catch {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/articles/${articleId}/comments`, {
            onSuccess: () => {
                reset('content');
                setIsReplying(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <div className={`flex gap-4 group ${depth > 0 ? 'ml-8 sm:ml-12 mt-4 border-l-2 border-gray-100 pl-4 dark:border-gray-800' : ''}`}>
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {comment.author_name.charAt(0)}
            </div>
            <div className="flex-1">
                <div className="mb-1 flex items-baseline justify-between">
                    <h5 className="font-bold text-gray-900 dark:text-white">
                        {comment.author_name}
                    </h5>
                    <span className="text-xs text-gray-500">
                        {comment.created_at_human}
                    </span>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-700/30 dark:text-gray-300 border border-gray-100 dark:border-gray-700/50">
                    {comment.content}
                </div>
                
                <div className="mt-2 flex items-center gap-4">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            isLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'
                        }`}
                    >
                        <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        {likesCount > 0 && <span>{likesCount}</span>}
                        <span className="sr-only">J'aime</span>
                    </button>
                    
                    <button 
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
                    >
                        <Reply className="h-3.5 w-3.5" />
                        Répondre
                    </button>
                </div>

                {isReplying && (
                    <form onSubmit={submitReply} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {!auth && (
                            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-xs focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                    required
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-xs focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                    required
                                    value={data.author_email}
                                    onChange={(e) => setData('author_email', e.target.value)}
                                />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <textarea
                                rows={2}
                                placeholder={`Répondre à ${comment.author_name}...`}
                                className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-xs focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                                required
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                            />
                            <Button type="submit" size="sm" disabled={processing} className="h-auto self-end">
                                <Reply className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </form>
                )}

                {/* Recursive Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4">
                        {comment.replies.map(reply => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                articleId={articleId} 
                                depth={depth + 1} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
