import test from 'node:test';
import assert from 'node:assert/strict';
import { articleSlug, articlePayload, publicArticle } from '../src/legacy/lib/articles.mjs';

const form = {title:'A new story',slug:'a-new-story',excerpt:'A useful summary.',author:'Games & Connect',category:'Community',featured_image:'/assets/games-connect/community.jpg',content:'## A heading\n\nOur latest community story.',tags:'Ghana, Community, Ghana',publish_date:'2026-10-28'};

test('article links and content are normalized without losing Markdown',()=>{
  assert.equal(articleSlug('Café & Games: Let’s Connect!'),'cafe-and-games-lets-connect');
  const row=articlePayload(form,'draft');
  assert.equal(row.content,form.content);
  assert.equal(row.status,'draft');
  assert.deepEqual(row.tags,['Ghana','Community']);
  assert.equal(row.read_time,1);
});

test('incomplete stories and unsafe covers cannot be published',()=>{
  for (const field of ['title','slug','excerpt','author','category','content']) assert.throws(()=>articlePayload({...form,[field]:''},'published'));
  assert.throws(()=>articlePayload({...form,slug:'not/a-valid-link'},'published'));
  assert.throws(()=>articlePayload({...form,featured_image:'javascript:alert(1)'},'published'));
  assert.throws(()=>articlePayload(form,'unknown'));
});

test('existing links and original publication timestamps are preserved',()=>{
  const original={slug:form.slug,published_at:'2026-10-28T08:30:00Z'};
  assert.equal(articlePayload(form,'published',original).published_at,original.published_at);
  assert.throws(()=>articlePayload({...form,slug:'changed-link'},'published',original));
});

test('database stories keep metadata compatible with the public article template',()=>{
  const article=publicArticle({slug:'old-story',excerpt:'Original summary',featured_image:null,published_at:'2025-09-04T00:00:00Z',read_time:5,tags:null});
  assert.equal(article.description,'Original summary');
  assert.equal(article.publishDate,'2025-09-04T00:00:00Z');
  assert.equal(article.readTime,'5 min read');
  assert.deepEqual(article.tags,[]);
});
