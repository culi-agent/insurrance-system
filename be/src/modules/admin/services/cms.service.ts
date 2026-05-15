import { AppDataSource } from '../../../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: 'faq' | 'page' | 'terms' | 'privacy' | 'help';
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  helpful_count: number;
  not_helpful_count: number;
}

export class CMSService {
  async createPage(input: Partial<CMSPage>): Promise<CMSPage> {
    const id = uuidv4();
    const slug = input.slug || this.generateSlug(input.title || '');
    await AppDataSource.query(
      `INSERT INTO cms_page (id, slug, title, content, category, status, meta_title, meta_description, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [id, slug, input.title, input.content, input.category || 'page', input.status || 'draft', input.meta_title || null, input.meta_description || null, input.sort_order || 0]
    );
    return { id, slug, title: input.title!, content: input.content!, category: input.category as any || 'page', status: (input.status as any) || 'draft', meta_title: input.meta_title, meta_description: input.meta_description, sort_order: input.sort_order || 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }

  async updatePage(id: string, input: Partial<CMSPage>): Promise<void> {
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && key !== 'id') { sets.push(`${key} = $${idx++}`); params.push(value); }
    }
    sets.push(`updated_at = NOW()`);
    params.push(id);
    await AppDataSource.query(`UPDATE cms_page SET ${sets.join(', ')} WHERE id = $${idx}`, params);
  }

  async getPage(slug: string): Promise<CMSPage | null> {
    const r = await AppDataSource.query(`SELECT * FROM cms_page WHERE slug = $1 AND status = 'published'`, [slug]);
    return r[0] || null;
  }

  async listPages(category?: string): Promise<CMSPage[]> {
    let query = `SELECT * FROM cms_page`;
    const params: any[] = [];
    if (category) { query += ` WHERE category = $1`; params.push(category); }
    query += ` ORDER BY sort_order ASC, created_at DESC`;
    return AppDataSource.query(query, params);
  }

  async deletePage(id: string): Promise<void> {
    await AppDataSource.query(`DELETE FROM cms_page WHERE id = $1`, [id]);
  }

  // FAQ
  async createFAQ(input: Partial<FAQItem>): Promise<FAQItem> {
    const id = uuidv4();
    await AppDataSource.query(
      `INSERT INTO cms_faq (id, question, answer, category, sort_order, is_published, helpful_count, not_helpful_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0, NOW(), NOW())`,
      [id, input.question, input.answer, input.category || 'general', input.sort_order || 0, input.is_published ?? true]
    );
    return { id, question: input.question!, answer: input.answer!, category: input.category || 'general', sort_order: input.sort_order || 0, is_published: input.is_published ?? true, helpful_count: 0, not_helpful_count: 0 };
  }

  async listFAQs(category?: string, publishedOnly: boolean = false): Promise<FAQItem[]> {
    let query = `SELECT * FROM cms_faq`;
    const conditions: string[] = [];
    const params: any[] = [];
    if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
    if (publishedOnly) { conditions.push(`is_published = true`); }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY sort_order ASC`;
    return AppDataSource.query(query, params);
  }

  async updateFAQ(id: string, input: Partial<FAQItem>): Promise<void> {
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined && key !== 'id') { sets.push(`${key} = $${idx++}`); params.push(value); }
    }
    sets.push(`updated_at = NOW()`);
    params.push(id);
    await AppDataSource.query(`UPDATE cms_faq SET ${sets.join(', ')} WHERE id = $${idx}`, params);
  }

  async voteFAQ(id: string, helpful: boolean): Promise<void> {
    const col = helpful ? 'helpful_count' : 'not_helpful_count';
    await AppDataSource.query(`UPDATE cms_faq SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
