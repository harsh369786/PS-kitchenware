"use server";
import type { BlogContent, Blog } from "./types";
import { supabase } from '@/lib/supabase';

const CONTENT_DOC_ID = "blogs";
const BUCKET_NAME = "uploads";

const initialBlogContent: BlogContent = {
  blogs: []
};

export async function getBlogContent(): Promise<BlogContent> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', CONTENT_DOC_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error reading blog content from Supabase:", error);
    }

    if (data?.data) {
      const content = data.data as BlogContent;
      if (!content.blogs) content.blogs = [];
      return content;
    }

    // Initialize content if not found
    await supabase.from('site_content').upsert({ id: CONTENT_DOC_ID, data: initialBlogContent });
    return initialBlogContent;

  } catch (error) {
    console.error("Critical error reading blog content:", error);
    return initialBlogContent;
  }
}

async function processImage(base64Data: string | undefined, fileName: string): Promise<string> {
  if (base64Data && base64Data.startsWith('data:image')) {
    try {
      const fileType = base64Data.match(/data:(image\/\w+);base64,/)?.[1];
      if (!fileType) throw new Error('Invalid image format');

      const base64 = base64Data.split(',')[1];
      const buffer = Buffer.from(base64, 'base64');
      const fileExtension = fileType.split('/')[1];
      const uniqueFileName = `${fileName}-${Date.now()}.${fileExtension}`;

      const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, buffer, {
          contentType: fileType,
          upsert: true
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image to Supabase:", error);
      throw new Error("Failed to upload image.");
    }
  }
  return base64Data || '';
}

export async function saveBlogContent(content: BlogContent): Promise<void> {
  try {
    // Process images
    if (content.blogs) {
      for (const blog of content.blogs) {
        if (blog.imageUrl && blog.imageUrl.startsWith('data:image')) {
          blog.imageUrl = await processImage(blog.imageUrl, `blog-${blog.id}`);
        }
        if (blog.featuredImage && blog.featuredImage.startsWith('data:image')) {
          blog.featuredImage = await processImage(blog.featuredImage, `blog-featured-${blog.id}`);
        }
      }
    }

    const { error } = await supabase
      .from('site_content')
      .upsert({ id: CONTENT_DOC_ID, data: content });

    if (error) throw error;
    
    try {
      const { revalidatePath } = require('next/cache');
      revalidatePath('/blogs', 'layout');
    } catch (e) {
      console.error("Failed to revalidate path after saving content:", e);
    }

  } catch (error) {
    console.error("Error saving blog content to Supabase:", error);
    throw new Error("Failed to save blog content.");
  }
}
