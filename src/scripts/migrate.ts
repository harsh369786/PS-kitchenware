
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key is fine if RLS allows write, otherwise might need service role key or user manual setup. Since I told user to enable all access, anon is fine.

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_CONTENT_PATH = path.join(process.cwd(), 'src', 'lib', 'site-content.json');
const ORDERS_PATH = path.join(process.cwd(), 'src', 'lib', 'orders.json');
const PUBLIC_UPLOADS_PATH = path.join(process.cwd(), 'public');

async function uploadFileToSupabase(localPath: string, fileName: string) {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, fileBuffer, {
                upsert: true,
                contentType: 'image/jpeg' // simplify content type detection or use mime-types package if needed, but usually Supabase detects or browser handles it.
            });

        if (error) {
            console.error(`Failed to upload ${fileName}:`, error.message);
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return publicUrlData.publicUrl;
    } catch (e) {
        console.error(`File not found or error reading: ${localPath}`);
        return null;
    }
}

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Site Content
    if (fs.existsSync(SITE_CONTENT_PATH)) {
        console.log('Migrating site content...');
        const contentRaw = fs.readFileSync(SITE_CONTENT_PATH, 'utf-8');
        const content = JSON.parse(contentRaw);

        // Helper to process images in content
        const processImages = async (items: any[]) => {
            for (const item of items) {
                if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
                    const relativePath = item.imageUrl;
                    const fileName = path.basename(relativePath);
                    const localFilePath = path.join(PUBLIC_UPLOADS_PATH, relativePath.replace(/^\//, '')); // remove leading slash

                    console.log(`Uploading image: ${relativePath}`);
                    const newUrl = await uploadFileToSupabase(localFilePath, fileName);
                    if (newUrl) {
                        item.imageUrl = newUrl;
                    }
                }

                // Recursively check subcategories
                if (item.subcategories) {
                    await processImages(item.subcategories);
                }

                // Check sizes if they have images (not in types currently but for future)
            }
        };

        if (content.heroProducts) await processImages(content.heroProducts);
        if (content.categories) await processImages(content.categories);

        // Push to Supabase
        const { error } = await supabase
            .from('site_content')
            .upsert({ id: 'main', data: content });

        if (error) {
            console.error('Error saving site_content to Supabase:', error);
        } else {
            console.log('Successfully migrated site_content!');
        }
    } else {
        console.log('No local site-content.json found. Skipping.');
    }

    // 2. Migrate Orders
    if (fs.existsSync(ORDERS_PATH)) {
        console.log('Migrating orders...');
        const ordersRaw = fs.readFileSync(ORDERS_PATH, 'utf-8');
        const orders = JSON.parse(ordersRaw);

        for (const order of orders) {
            // Generate ID if needed or use existing
            // Map fields
            const dbOrder = {
                id: order.id,
                product_name: order.productName,
                quantity: order.quantity,
                price: order.price,
                size: order.size,
                image_url: order.imageUrl,
                date: order.date
            };

            // If image is local, upload it
            if (dbOrder.image_url && dbOrder.image_url.startsWith('/uploads/')) {
                const relativePath = dbOrder.image_url;
                const fileName = path.basename(relativePath);
                const localFilePath = path.join(PUBLIC_UPLOADS_PATH, relativePath.replace(/^\//, ''));

                const newUrl = await uploadFileToSupabase(localFilePath, fileName);
                if (newUrl) dbOrder.image_url = newUrl;
            }

            const { error } = await supabase.from('orders').upsert(dbOrder);
            if (error) console.error(`Error migrating order ${order.id}:`, error.message);
        }
        console.log(`Processed ${orders.length} orders.`);
    } else {
        console.log('No local orders.json found. Skipping.');
    }
}

migrate();
