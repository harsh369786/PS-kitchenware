
"use server";
import { promises as fs } from "fs";
import path from "path";
import type { SiteContent } from "./types";
import { PlaceHolderImages } from "./placeholder-images";
import { revalidatePath } from 'next/cache';

const contentFilePath = path.join(process.cwd(), "src/lib/site-content.json");

const initialCategories = [
    { id: "cat-laddles", name: "Laddles and Palta’s", href: "/category/laddles", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-laddles')?.imageUrl || '', imageHint: 'laddles kitchen' },
    { id: "cat-doyas", name: "Doya’s", href: "/category/doyas", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-doyas')?.imageUrl || '', imageHint: 'serving spoon' },
    { id: "cat-jaras", name: "Jara’s", href: "/category/jaras", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-jaras')?.imageUrl || '', imageHint: 'slotted spoon' },
    { id: "cat-steamers", name: "Steamer and Washer", href: "/category/steamers", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-steamers')?.imageUrl || '', imageHint: 'steamer pot' },
    { id: "cat-vati", name: "Vati and Plates", href: "/category/vati-plates", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-vati')?.imageUrl || '', imageHint: 'bowls plates' },
    { id: "cat-glasses", name: "Glasses", href: "/category/glasses", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-glasses')?.imageUrl || '', imageHint: 'drinking glasses' },
    { id: "cat-others", name: "Others", href: "/category/others", imageUrl: PlaceHolderImages.find(p => p.id === 'cat-others')?.imageUrl || '', imageHint: 'kitchenware various' },
].map(cat => ({ ...cat, imageUrl: cat.imageUrl || `https://picsum.photos/seed/${cat.id}/600/400`, subcategories: [] }));

const initialHeroProducts = PlaceHolderImages.filter((p) => p.id.startsWith("hero-")).map((p, i) => ({
    id: p.id,
    name: `Product Example ${i + 1}`,
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
    const fileContent = await fs.readFile(contentFilePath, "utf-8");
    const content = JSON.parse(fileContent) as SiteContent;
    // Ensure categories have a subcategories array
    content.categories.forEach(cat => {
        if (!cat.subcategories) {
            cat.subcategories = [];
        }
    });
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist, create it with initial data
      await fs.writeFile(contentFilePath, JSON.stringify(initialContent, null, 2));
      return initialContent;
    }
    console.error("Error reading site content:", error);
    return initialContent;
  }
}

async function processImage(base64Data: string | undefined, fileName: string): Promise<string> {
    if (base64Data && base64Data.startsWith('data:image')) {
        const fileType = base64Data.match(/data:(image\/\w+);base64,/)?.[1];
        if (!fileType) throw new Error('Invalid image format');
        
        const base64 = base64Data.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        const publicPath = path.join(process.cwd(), "public", "uploads");
        const fileExtension = fileType.split('/')[1];
        const uniqueFileName = `${fileName}-${Date.now()}.${fileExtension}`;
        const filePath = path.join(publicPath, uniqueFileName);
        
        await fs.mkdir(publicPath, { recursive: true });
        await fs.writeFile(filePath, buffer);
        
        return `/uploads/${uniqueFileName}`;
    }
    return base64Data || '';
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  try {
    
    for (const product of content.heroProducts) {
        product.imageUrl = await processImage(product.imageUrl, `hero-${product.id}`);
    }

    for (const category of content.categories) {
        category.imageUrl = await processImage(category.imageUrl, `category-${category.id}`);
        if (category.subcategories) {
            for (const subcategory of category.subcategories) {
                if (subcategory.imageUrl) {
                    subcategory.imageUrl = await processImage(subcategory.imageUrl, `subcategory-${subcategory.id}`);
                }
            }
        }
    }

    await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2));
    
    // Revalidate paths to show updated content
    revalidatePath('/', 'layout');
    revalidatePath('/category/[slug]', 'page');
    revalidatePath('/search', 'page');

  } catch (error) {
    console.error("Error saving site content:", error);
    throw new Error("Failed to save site content.");
  }
}
