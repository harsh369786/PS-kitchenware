"use server";
import type { SiteContent } from "./types";
import { PlaceHolderImages } from "./placeholder-images";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid or use random string

const CONTENT_DOC_ID = "main";
const BUCKET_NAME = "uploads";

const initialCategories = [
  { id: "cat-laddles", name: "Laddles and Palta’s", href: "/category/laddles", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-laddles')?.imageUrl ?? '', imageHint: 'laddles kitchen', subcategories: [] },
  { id: "cat-doyas", name: "Doya’s", href: "/category/doyas", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-doyas')?.imageUrl ?? '', imageHint: 'serving spoon', subcategories: [] },
  { id: "cat-jaras", name: "Jara’s", href: "/category/jaras", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-jaras')?.imageUrl ?? '', imageHint: 'slotted spoon', subcategories: [] },
  { id: "cat-steamers", name: "Steamer and Washer", href: "/category/steamers", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-steamers')?.imageUrl ?? '', imageHint: 'steamer pot', subcategories: [] },
  { id: "cat-vati", name: "Vati and Plates", href: "/category/vati-plates", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-vati')?.imageUrl ?? '', imageHint: 'bowls plates', subcategories: [] },
  { id: "cat-glasses", name: "Glasses", href: "/category/glasses", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-glasses')?.imageUrl ?? '', imageHint: 'drinking glasses', subcategories: [] },
  { id: "cat-others", name: "Others", href: "/category/others", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-others')?.imageUrl ?? '', imageHint: 'kitchenware various', subcategories: [] },
];

const initialHeroProducts = PlaceHolderImages.filter((p) => p.id.startsWith("hero-")).slice(0, 5).map((p, i) => ({
  productId: `prod-${i}`,
  tagline: `Essential for your modern home`,
  imageUrl: p.imageUrl,
  imageHint: p.imageHint,
}));

const initialContent: SiteContent = {
  heroProducts: initialHeroProducts,
  categories: initialCategories
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', CONTENT_DOC_ID)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" basically
      console.error("Error reading site content from Supabase:", error);
    }

    if (data?.data) {
      const content = data.data as SiteContent;
      // Ensure data integrity
      if (!content.heroProducts) content.heroProducts = [];
      if (!content.categories) content.categories = [];
      content.categories.forEach(cat => {
        if (!cat.subcategories) cat.subcategories = [];
      });
      return content;
    }

    // Initialize content if not found
    await supabase.from('site_content').upsert({ id: CONTENT_DOC_ID, data: initialContent });
    return initialContent;

  } catch (error) {
    console.error("Critical error reading site content:", error);
    return initialContent;
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

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image to Supabase:", error);
      throw new Error("Failed to upload image.");
    }
  }
  return base64Data || '';
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  try {
    // Process images
    if (content.heroProducts) {
      for (const product of content.heroProducts) {
        if (product.imageUrl && product.imageUrl.startsWith('data:image')) {
          product.imageUrl = await processImage(product.imageUrl, `hero-${product.productId}`);
        }
      }
    }

    if (content.categories) {
      for (const category of content.categories) {
        if (category.imageUrl && category.imageUrl.startsWith('data:image')) {
          category.imageUrl = await processImage(category.imageUrl, `category-${category.id}`);
        }
        if (category.subcategories) {
          for (const subcategory of category.subcategories) {
            if (subcategory.imageUrl && subcategory.imageUrl.startsWith('data:image')) {
              subcategory.imageUrl = await processImage(subcategory.imageUrl, `subcategory-${subcategory.id}`);
            }
          }
        }
      }
    }

    const { error } = await supabase
      .from('site_content')
      .upsert({ id: CONTENT_DOC_ID, data: content });

    if (error) throw error;

  } catch (error) {
    console.error("Error saving site content to Supabase:", error);
    throw new Error("Failed to save site content.");
  }
}
