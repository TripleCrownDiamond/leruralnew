export type ArticleContentMode = 'wysiwyg' | 'markdown';

export const ARTICLE_MARKDOWN_PREFIX = '<!--ARTICLE_CONTENT:MARKDOWN-->';

function stripHtmlTags(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\r/g, '')
        .trim();
}

export function htmlToMarkdown(html: string): string {
    if (!html) return '';

    return html
        .replace(/\r/g, '')
        .replace(/<\s*br\s*\/?\s*>/gi, '\n')
        .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|blockquote|li)>/gi, '\n')
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n')
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n')
        .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
        .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
        .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
        .replace(/<li[^>]*>([\s\S]*?)\n/gi, '- $1\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();
}

export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    const escaped = markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const lines = escaped.split(/\r?\n/);
    const html: string[] = [];
    let inList = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            if (inList) {
                html.push('</ul>');
                inList = false;
            }
            continue;
        }

        if (line.startsWith('- ')) {
            if (!inList) {
                html.push('<ul>');
                inList = true;
            }
            html.push(`<li>${line.slice(2)}</li>`);
            continue;
        }

        if (inList) {
            html.push('</ul>');
            inList = false;
        }

        if (line.startsWith('### ')) {
            html.push(`<h3>${line.slice(4)}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            html.push(`<h2>${line.slice(3)}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            html.push(`<h1>${line.slice(2)}</h1>`);
            continue;
        }

        html.push(`<p>${line}</p>`);
    }

    if (inList) {
        html.push('</ul>');
    }

    return html
        .join('')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

export function parseStoredArticleContent(content: string | null | undefined): {
    mode: ArticleContentMode;
    visualContent: string;
    markdownContent: string;
} {
    const rawContent = content ?? '';
    const normalizedContent = rawContent.replace(/^\uFEFF/, '');

    if (!normalizedContent.startsWith(ARTICLE_MARKDOWN_PREFIX)) {
        return {
            mode: 'wysiwyg',
            visualContent: rawContent,
            markdownContent: htmlToMarkdown(rawContent),
        };
    }

    const markdownContent = normalizedContent
        .slice(ARTICLE_MARKDOWN_PREFIX.length)
        .replace(/^\r?\n/, '');

    return {
        mode: 'markdown',
        visualContent: markdownToHtml(markdownContent),
        markdownContent,
    };
}

export function buildStoredArticleContent(mode: ArticleContentMode, visualContent: string, markdownContent: string): string {
    if (mode === 'markdown') {
        return `${ARTICLE_MARKDOWN_PREFIX}\n${markdownContent}`;
    }

    return visualContent;
}

export function hasMeaningfulContent(value: string): boolean {
    return stripHtmlTags(value).length > 0;
}
