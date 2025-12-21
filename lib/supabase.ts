import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'moderator' | 'admin';
  avatar_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  subject_id: string;
  semester?: string;
  pdf_url?: string;
  external_link?: string;
  author_id?: string;
  views: number;
  is_published: boolean;
  is_premium: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  author?: Profile;
  tags?: Tag[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
};

export type Upload = {
  id: string;
  title: string;
  content?: string;
  subject_id?: string;
  suggested_subject_name?: string;
  semester?: string;
  pdf_url?: string;
  external_link?: string;
  tags?: string[];
  uploader_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  subject?: Subject;
  uploader?: Profile;
};

export type Module = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  resources?: Resource[];
};

export type ResourceType = 'lesson' | 'pdf' | 'book' | 'link' | 'document';

export type Resource = {
  id: string;
  module_id: string;
  subject_id: string;
  title: string;
  slug: string;
  description?: string;
  resource_type: ResourceType;
  content?: string;
  pdf_url?: string;
  external_link?: string;
  author_id: string;
  is_published: boolean;
  is_premium: boolean;
  order_index: number;
  views: number;
  created_at: string;
  updated_at: string;
  module?: Module;
  subject?: Subject;
  author?: Profile;
  tags?: Tag[];
};
