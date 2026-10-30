export function articleSlug(title) {
  return String(title).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function publicArticle(row) {
  return { ...row, description: row.excerpt, image: row.featured_image || undefined,
    publishDate: row.published_at || row.created_at, readTime: `${row.read_time || 1} min read`, tags: row.tags || [] };
}

export function articlePayload(form, status, original) {
  const title = form.title.trim(), slug = form.slug.trim(), content = form.content.trim();
  if (!title || !content || !form.excerpt.trim() || !form.author.trim() || !form.category.trim()) throw new Error('Add a title, summary, author, category and article content.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180) throw new Error('Use a link with lowercase letters, numbers and single hyphens (up to 180 characters).');
  if (original && slug !== original.slug) throw new Error('An existing article’s link cannot be changed.');
  if (!['draft','published','archived'].includes(status)) throw new Error('Choose a valid article status.');
  const image = form.featured_image.trim();
  if (image && !image.startsWith('/assets/') && !/^https:\/\//i.test(image)) throw new Error('Use an HTTPS image URL or a site image path starting with /assets/.');
  const publishedDate = form.publish_date || new Date().toISOString().slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedDate) || Number.isNaN(Date.parse(publishedDate))) throw new Error('Choose a valid publication date.');
  const published_at = original?.published_at?.slice(0,10) === publishedDate ? original.published_at : `${publishedDate}T12:00:00.000Z`;
  return { title, slug, content, excerpt: form.excerpt.trim(), author: form.author.trim(), category: form.category.trim(),
    featured_image: image || null, tags: [...new Set(form.tags.split(',').map(tag => tag.trim()).filter(Boolean))],
    read_time: Math.max(1, Math.ceil(content.split(/\s+/).length/200)), status, published_at,
    updated_at: new Date().toISOString() };
}
