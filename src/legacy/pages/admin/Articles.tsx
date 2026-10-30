import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Plus, Search, ArrowLeft, Eye, Save, Upload } from 'lucide-react';
import { useAdminArticles } from '@/hooks/useArticles';
import { supabase } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { articleSlug, articlePayload } from '@/lib/articles.mjs';
import './articles.css';

const empty = () => ({title:'',slug:'',excerpt:'',author:'Games & Connect',category:'Community',featured_image:'',content:'',tags:'',publish_date:new Date().toISOString().slice(0,10)});
function fromRow(row: any) { return {...empty(),...row,tags:(row.tags || []).join(', '),featured_image:row.featured_image || '',publish_date:(row.published_at || row.created_at).slice(0,10)}; }

export default function Articles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {data:rows=[],isLoading,error,refetch} = useAdminArticles();
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('all');
  const editing = !!id;
  const record = rows.find(row => row.id === id);
  // Keep the version actually opened in the editor for conflict detection.
  const [original,setOriginal] = useState<any>(null);
  const [form,setForm] = useState(empty);
  const [dirty,setDirty] = useState(false);
  const [slugEdited,setSlugEdited] = useState(false);
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [preview,setPreview] = useState(false);
  const [notice,setNotice] = useState('');
  const [saveError,setSaveError] = useState('');
  const [loadedId,setLoadedId] = useState('');
  useEffect(() => {
    if (!editing) {setLoadedId('');setDirty(false);return;}
    if (loadedId === id) return;
    if (id === 'new' || record) {
      setOriginal(record || null);setForm(record ? fromRow(record) : empty());setDirty(false);setSlugEdited(!!record);setPreview(false);setSaveError('');setLoadedId(id);
    }
  },[id,record,loadedId,editing]);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {event.preventDefault();event.returnValue='';};
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]');
      if (link && !window.confirm('Leave this article and discard unsaved changes?')) {event.preventDefault();event.stopImmediatePropagation();}
    };
    window.addEventListener('beforeunload',unload);document.addEventListener('click',leave,true);
    return () => {window.removeEventListener('beforeunload',unload);document.removeEventListener('click',leave,true);};
  },[dirty]);
  function change(name:string,value:string) {
    setForm(current => ({...current,[name]:value,...(name==='title' && !slugEdited && !original ? {slug:articleSlug(value)} : {})}));
    if (name === 'slug') setSlugEdited(true);
    setDirty(true);setNotice('');setSaveError('');
  }
  async function save(status:string) {
    if (saving || uploading) return;
    setSaving(true);setSaveError('');setNotice('');
    try {
      const payload = articlePayload(form,status,original);
      const response = original
        ? await supabase.from('blog_posts').update(payload).eq('id',original.id).eq('updated_at',original.updated_at).select().single()
        : await supabase.from('blog_posts').insert(payload).select().single();
      if (response.error) {
        if (response.error.code === '23505') throw new Error('That article link is already in use. Choose a different link.');
        if (response.error.code === 'PGRST116') throw new Error('This article changed in another session. Reload it before saving again.');
        throw new Error('Your article could not be saved. Your changes are still here; please retry.');
      }
      const saved = response.data;
      queryClient.setQueryData(['admin-articles'],(current:any[] = []) => [saved,...current.filter(row=>row.id!==saved.id)]);
      await queryClient.invalidateQueries({queryKey:['published-articles']});
      setOriginal(saved);setForm(fromRow(saved));setDirty(false);
      setNotice(status === 'published' ? 'Article published. Your changes are saved.' : status === 'archived' ? 'Article archived.' : 'Draft saved.');
      if(id==='new') {setLoadedId(saved.id);navigate(`/admin/articles/${saved.id}`,{replace:true});}
    } catch (error) {setSaveError(error instanceof Error ? error.message : 'Unable to save article.');}
    finally {setSaving(false);}
  }
  async function upload(file?:File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>10*1024*1024) {setSaveError('Choose a JPG, PNG or WebP image smaller than 10 MB.');return;}
    setUploading(true);setSaveError('');
    try {change('featured_image',await uploadToCloudinary(file,'games-and-connect/articles'));}
    catch {setSaveError('The image could not be uploaded. Please retry or enter an image URL.');}
    finally {setUploading(false);}
  }
  const visible = rows.filter(row => (filter==='all' || row.status===filter) && `${row.title} ${row.author} ${row.category}`.toLowerCase().includes(search.toLowerCase()));
  const input = (name:keyof ReturnType<typeof empty>,label:string,props:any={}) => <label>{label}<input value={form[name]} onChange={e=>change(name,e.target.value)} {...props}/></label>;
  return <div className="article-manager">
    <header className="article-manager-heading"><div><span className="article-eyebrow">CONTENT</span><h2>{editing ? id==='new' ? 'Write an article' : 'Edit article' : 'Articles'}</h2><p>{editing ? 'Write, preview and publish your story.' : 'All your stories, guides and community updates.'}</p></div>{!editing && <Link className="article-primary" to="/admin/articles/new"><Plus size={17}/> New article</Link>}</header>
    {isLoading || (editing && loadedId !== id && (id==='new' || record)) ? <p role="status">Loading articles…</p> : error ? <div role="alert"><p>Articles could not be loaded.</p><button onClick={()=>refetch()}>Try again</button></div> : !editing ? <>
      <div className="article-totals">{[['all','All articles'],['published','Published'],['draft','Drafts'],['archived','Archived']].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}><strong>{value==='all' ? rows.length : rows.filter(row=>row.status===value).length}</strong>{label}</button>)}</div>
      <label className="article-search"><Search size={18}/><span className="sr-only">Search articles</span><input placeholder="Search articles, authors or categories" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <div className="article-list">{visible.length ? visible.map(row=><article key={row.id}>{row.featured_image && <img src={row.featured_image} alt="" loading="lazy"/>}<div className="article-row-copy"><div className="article-row-meta"><span className={`article-status article-status-${row.status}`}>{row.status}</span><span>{row.category}</span></div><h3><Link to={`/admin/articles/${row.id}`}>{row.title}</Link></h3><p>{row.excerpt}</p><small>{row.author} · {new Date(row.published_at || row.created_at).toLocaleDateString('en-GB')}</small></div><Link className="article-secondary" to={`/admin/articles/${row.id}`}>Edit article →</Link></article>) : <p className="article-empty">{rows.length ? 'No articles match this search.' : 'No articles yet. Write your first story.'}</p>}</div>
    </> : id!=='new' && !record ? <p role="alert">Article not found. <Link to="/admin/articles">Back to articles</Link></p> : <>
      <div className="article-editor-toolbar"><Link to="/admin/articles"><ArrowLeft size={16}/> All articles</Link><span>{dirty ? 'Unsaved changes' : original?.status || 'New draft'}</span>{original?.status==='published' && <a href={`/blog/${original.slug}`} target="_blank" rel="noreferrer">View article ↗</a>}<button className="article-secondary" onClick={()=>setPreview(!preview)}><Eye size={16}/>{preview ? 'Back to editor' : 'Preview'}</button></div>
      {notice && <p role="status" className="article-notice">{notice}</p>}{saveError && <p role="alert" className="article-error">{saveError}</p>}
      <form onSubmit={e=>{e.preventDefault();save(original?.status==='published' ? 'published' : 'draft');}}>
        <fieldset disabled={saving || uploading}>
        {preview ? <article className="article-preview"><span className="article-eyebrow">{form.category} · PREVIEW</span><h1>{form.title || 'Your article title'}</h1><p>{form.excerpt}</p><small>{form.author} · {form.publish_date}</small>{form.featured_image && <img src={form.featured_image} alt={form.title}/>}<div className="prose max-w-none"><ReactMarkdown>{form.content || 'Your article content will appear here.'}</ReactMarkdown></div></article> : <div className="article-editor-grid"><div className="article-editor-main">
          {input('title','Article title *',{required:true,maxLength:200,placeholder:'Give your story a title'})}
          <label>Summary *<textarea value={form.excerpt} onChange={e=>change('excerpt',e.target.value)} required maxLength={500} rows={3} placeholder="A short introduction for the blog listing and search results"/></label>
          <label>Article content *<textarea className="article-content-input" value={form.content} onChange={e=>change('content',e.target.value)} required rows={20} placeholder={'Write your article here.\n\n## Add headings\nUse **bold**, lists and [links](/events).'} /></label><p className="article-field-help">Markdown supported: ## headings, **bold**, lists and [link text](URL). Use Preview to review the article.</p>
        </div><aside className="article-editor-settings">
          {input('slug','Article link *',{required:true,readOnly:!!original,placeholder:'your-article-name'})}<p className="article-field-help">/blog/{form.slug || 'your-article-name'}{original && <><br/>This link stays fixed to preserve shared links.</>}</p>
          {input('author','Author *',{required:true,maxLength:120})}{input('category','Category *',{required:true,maxLength:80,list:'article-categories'})}<datalist id="article-categories">{['Community','Gaming','Travel','Events','Team Building','Guides'].map(value=><option key={value} value={value}/>)}</datalist>
          {input('publish_date','Publication date',{type:'date',required:true})}{input('tags','Tags',{placeholder:'Travel, Accra, Community'})}{input('featured_image','Cover image URL',{placeholder:'https://… or /assets/…'})}
          <label className="article-upload"><Upload size={16}/> {uploading ? 'Uploading…' : 'Upload cover image'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || saving} onChange={e=>upload(e.target.files?.[0])}/></label><small>JPG, PNG or WebP · up to 10 MB</small>{form.featured_image && <img className="article-cover-preview" src={form.featured_image} alt="Cover preview"/>}
        </aside></div>}
        </fieldset>
        <div className="article-save-bar"><p>{saving ? 'Saving article…' : 'Drafts are only visible in Admin. Published articles appear on the blog.'}</p><div>
          {original?.status==='published' && <button type="button" className="article-secondary" disabled={saving || uploading} onClick={()=>save('draft')}>Unpublish to draft</button>}
          {original && original.status!=='published' && original.status!=='archived' && <button type="button" className="article-secondary" disabled={saving || uploading} onClick={()=>save('archived')}>Archive</button>}
          {original?.status!=='published' && <button type="button" className="article-secondary" disabled={saving || uploading} onClick={()=>save('draft')}><Save size={16}/> Save draft</button>}
          <button type="button" className="article-primary" disabled={saving || uploading} onClick={()=>save('published')}>{saving ? 'Saving…' : original?.status==='published' ? 'Save changes' : 'Publish article'}</button>
        </div></div>
      </form>
    </>}
  </div>;
}
