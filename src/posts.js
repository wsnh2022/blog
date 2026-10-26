import about from 'virtual:repo-about';

const modules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });

const titleFromId = (id) => id.split(/[-_]/).join(' ').replace(/\b\w/g, (l) => l.toUpperCase());

const field = (yaml, name) => {
    const m = yaml.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
    return m ? m[1].replace(/['"]/g, '').trim() : '';
};

const firstParagraph = (markdown) => {
    const line = markdown
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l && !/^(#|!\[|<|\||```|-|\*\*Live Demo)/.test(l));
    if (!line) return '';
    const text = line
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_`]/g, '')
        .trim();
    if (text.length <= 160) return text;
    return text.slice(0, 160).replace(/\s+\S*$/, '') + '…';
};

const parse = (path) => {
    const id = path.split('/').pop().replace('.md', '');
    const text = modules[path].trim();
    let yaml = '';
    let content = text;

    if (text.startsWith('---')) {
        const parts = text.split('---');
        if (parts.length >= 3) {
            yaml = parts[1];
            content = parts.slice(2).join('---').trim();
        }
    }

    const firstLine = content.split('\n')[0].trim();
    const remoteUrl = firstLine.startsWith('https://github.com/') ? firstLine : '';
    const repo = remoteUrl ? remoteUrl.split('/').slice(3, 5).join('/') : '';

    let title = field(yaml, 'title');
    if (!title) {
        const header = content.match(/^#\s+(.*)/m);
        title = header ? header[1].trim() : titleFromId(id);
    }

    const summary = about[repo.toLowerCase()] || field(yaml, 'description');
    const description = summary || (remoteUrl ? '' : firstParagraph(content));
    const tags = field(yaml, 'tags').replace(/[[\]#]/g, '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    return {
        id,
        title,
        date: field(yaml, 'date'),
        image: field(yaml, 'image') || null,
        description,
        summary,
        tags,
        remoteUrl,
        repo,
        content,
        hasFrontmatterTitle: Boolean(field(yaml, 'title')),
    };
};

export const posts = Object.keys(modules)
    .map(parse)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

export const getPost = (id) => posts.find((p) => p.id === id);

export const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

const tagCount = (tag) => posts.filter((p) => p.tags.includes(tag)).length;
export const topTags = [...allTags].sort((a, b) => tagCount(b) - tagCount(a)).slice(0, 6);

const asDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (iso) => {
    const d = asDate(iso);
    return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : iso;
};

export const groupByMonth = (list) => {
    const groups = [];
    list.forEach((post) => {
        const d = asDate(post.date);
        const name = d ? d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Undated';
        const last = groups[groups.length - 1];
        if (last && last.name === name) last.posts.push(post);
        else groups.push({ name, posts: [post] });
    });
    return groups;
};
