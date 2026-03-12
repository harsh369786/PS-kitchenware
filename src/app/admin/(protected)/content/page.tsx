'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSiteContent, saveSiteContent } from '@/lib/site-content';
import { uploadImageToStorage } from '@/lib/upload-image';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Save, ImageIcon, GripVertical, AlertCircle, Upload, X, Layers, Tag, FolderOpen, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { SiteContent, SubCategory } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductSizes from '@/components/product-sizes';

// ═══════════════════════════════════════════════════
// Schemas
// ═══════════════════════════════════════════════════
const productSizeSchema = z.object({
  name: z.string().optional(),
  price: z.coerce.number().optional(),
});

const heroProductSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  tagline: z.string().optional(),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});

const subCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Subcategory name is required'),
  href: z.string(),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  imageHint: z.string().optional(),
  price: z.coerce.number().optional(),
  sizes: z.array(productSizeSchema).optional(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  href: z.string(),
  imageUrl: z.string().min(1, 'Image is required'),
  imageHint: z.string().optional(),
  subcategories: z.array(subCategorySchema).optional(),
});

const formSchema = z.object({
  heroProducts: z.array(heroProductSchema),
  categories: z.array(categorySchema),
});

type FormValues = z.infer<typeof formSchema>;

const slugify = (text: string) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// ═══════════════════════════════════════════════════
// Image Upload Drop Zone Component
// ═══════════════════════════════════════════════════
function ImageUploadZone({
  value,
  onChange,
  prefix,
  label,
  compact = false,
}: {
  value?: string;
  onChange: (url: string) => void;
  prefix: string;
  label?: string;
  compact?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Please use an image under 5MB.' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload an image file.' });
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, prefix);
      onChange(url);
      toast({ title: '✓ Uploaded', description: 'Image uploaded successfully.' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  if (value && !isUploading) {
    return (
      <div className="group relative">
        {label && <p className="text-sm font-medium mb-1.5">{label}</p>}
        <div className={`relative overflow-hidden rounded-lg border-2 border-dashed border-transparent hover:border-primary/30 transition-all ${compact ? 'w-24 h-24' : 'w-full aspect-video max-h-48'}`}>
          <Image src={value} alt="Preview" fill className="object-cover rounded-lg" sizes={compact ? '96px' : '400px'} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="secondary" className="h-8 text-xs shadow-lg" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1" /> Replace
              </Button>
              <Button type="button" size="sm" variant="destructive" className="h-8 text-xs shadow-lg" onClick={() => onChange('')}>
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  return (
    <div>
      {label && <p className="text-sm font-medium mb-1.5">{label}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200
          ${compact ? 'w-24 h-24 p-2' : 'w-full py-8 px-4'}
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className={`animate-spin text-primary ${compact ? 'h-5 w-5' : 'h-8 w-8'}`} />
            {!compact && <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>}
          </>
        ) : (
          <>
            <div className={`rounded-full bg-muted flex items-center justify-center ${compact ? 'h-8 w-8' : 'h-12 w-12'}`}>
              <ImageIcon className={`text-muted-foreground ${compact ? 'h-4 w-4' : 'h-6 w-6'}`} />
            </div>
            {!compact && (
              <>
                <p className="mt-3 text-sm font-medium text-foreground">Drop image here or click to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
              </>
            )}
          </>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Multi-Image Upload Component (2 images per product)
// ═══════════════════════════════════════════════════
function MultiImageUpload({
  imageUrls,
  onChange,
  prefix,
}: {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  prefix: string;
}) {
  const { toast } = useToast();

  const handleAddImage = async (file: File, slot: number) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Please use an image under 5MB.' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload an image file.' });
      return;
    }
    toast({ title: 'Uploading...', description: `Uploading image ${slot + 1}...` });
    try {
      const url = await uploadImageToStorage(file, `${prefix}-img${slot}`);
      const newUrls = [...imageUrls];
      newUrls[slot] = url;
      onChange(newUrls);
      toast({ title: '✓ Uploaded', description: `Image ${slot + 1} uploaded.` });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Please try again.' });
    }
  };

  const handleRemoveImage = (slot: number) => {
    const newUrls = [...imageUrls];
    newUrls[slot] = '';
    // Clean trailing empty slots
    while (newUrls.length > 0 && newUrls[newUrls.length - 1] === '') {
      newUrls.pop();
    }
    onChange(newUrls);
  };

  return (
    <div>
      <p className="text-xs font-medium mb-1.5">Product Images (2 photos - auto-scrolls on site)</p>
      <div className="flex gap-2">
        {[0, 1].map((slot) => {
          const url = imageUrls[slot] || '';
          return (
            <ImageSlot
              key={slot}
              slot={slot}
              url={url}
              onUpload={(file) => handleAddImage(file, slot)}
              onRemove={() => handleRemoveImage(slot)}
            />
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Both images will auto-scroll every 2-3s on the storefront</p>
    </div>
  );
}

function ImageSlot({
  slot,
  url,
  onUpload,
  onRemove,
}: {
  slot: number;
  url: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await onUpload(file);
      setIsUploading(false);
    }
  };

  if (url && !isUploading) {
    return (
      <div className="group relative w-20 h-20 rounded-md overflow-hidden border">
        <Image src={url} alt={`Photo ${slot + 1}`} fill className="object-cover" sizes="80px" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button type="button" size="icon" variant="destructive" className="h-6 w-6" onClick={onRemove}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/60 text-white py-0.5">Photo {slot + 1}</span>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  return (
    <div
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className="w-20 h-20 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center transition-all hover:bg-muted/50"
    >
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground mt-1">Photo {slot + 1}</span>
        </>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Delete Confirmation Dialog
// ═══════════════════════════════════════════════════
function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════
// Empty State Component
// ═══════════════════════════════════════════════════
function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════
export default function ContentAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banners');
  const [productList, setProductList] = useState<SubCategory[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: '', description: '', onConfirm: () => { },
  });
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heroProducts: [],
      categories: [],
    },
  });

  const { control, setValue, getValues, reset, formState } = form;

  // Refresh product list without using watch (avoids infinite re-render loop)
  const refreshProductList = useCallback(() => {
    const cats = getValues('categories');
    const products: SubCategory[] = (cats || []).flatMap(cat => cat.subcategories || []);
    setProductList(products);
  }, [getValues]);

  const updateHrefs = useCallback((categoryIndex: number, subcategoryIndex?: number) => {
    const categories = getValues('categories');
    const category = categories[categoryIndex];
    if (!category) return;

    const categorySlug = slugify(category.name);
    const expectedCategoryHref = `/category/${categorySlug}`;
    if (category.href !== expectedCategoryHref) {
      setValue(`categories.${categoryIndex}.href`, expectedCategoryHref, { shouldDirty: true, shouldTouch: true });
    }

    if (subcategoryIndex !== undefined) {
      const subcategory = category.subcategories?.[subcategoryIndex];
      if (subcategory) {
        const subcategorySlug = slugify(subcategory.name);
        const expectedSubHref = `${expectedCategoryHref}/${subcategorySlug}`;
        if (subcategory.href !== expectedSubHref) {
          setValue(`categories.${categoryIndex}.subcategories.${subcategoryIndex}.href`, expectedSubHref, { shouldDirty: true, shouldTouch: true });
        }
      }
    } else {
      category.subcategories?.forEach((sub, subIndex) => {
        const subcategorySlug = slugify(sub.name);
        const expectedSubHref = `${expectedCategoryHref}/${subcategorySlug}`;
        if (sub.href !== expectedSubHref) {
          setValue(`categories.${categoryIndex}.subcategories.${subIndex}.href`, expectedSubHref, { shouldDirty: true, shouldTouch: true });
        }
      });
    }
  }, [getValues, setValue]);

  const { fields: heroProductFields, append: appendHero, remove: removeHero, move: moveHero } = useFieldArray({
    control,
    name: "heroProducts",
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory, move: moveCategory } = useFieldArray({
    control,
    name: "categories",
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getSiteContent();
        const sanitizedContent = {
          heroProducts: content.heroProducts.map(p => ({
            productId: p.productId,
            tagline: p.tagline,
            imageUrl: p.imageUrl,
            imageHint: p.imageHint,
          })),
          categories: content.categories.map(c => ({
            ...c,
            subcategories: c.subcategories?.map(sc => ({
              ...sc,
              imageUrls: sc.imageUrls || (sc.imageUrl ? [sc.imageUrl] : []),
              price: sc.price ?? undefined,
              sizes: sc.sizes?.map(s => ({ ...s, price: s.price ?? undefined })) || []
            })) || []
          }))
        };
        reset(sanitizedContent);
        // Build product list after data loads
        setTimeout(() => {
          const cats = sanitizedContent.categories;
          setProductList(cats.flatMap(cat => cat.subcategories || []));
        }, 0);
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load site content.' });
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const cleanedData: SiteContent = {
        heroProducts: data.heroProducts.map(p => ({
          productId: p.productId,
          tagline: p.tagline || '',
          imageUrl: p.imageUrl || '',
          imageHint: p.imageHint || '',
        })),
        categories: data.categories.map(c => ({
          ...c,
          subcategories: c.subcategories?.map(sc => ({
            ...sc,
            imageUrl: sc.imageUrls?.[0] || sc.imageUrl || '',
            imageUrls: (sc.imageUrls || []).filter(u => u && u.trim() !== ''),
            price: sc.price ? Number(sc.price) : undefined,
            sizes: sc.sizes
              ?.filter(s => s && s.name && s.name.trim() !== '')
              .map(s => ({ ...s, price: s.price ? Number(s.price) : 0 }))
          }))
        }))
      };

      await saveSiteContent(cleanedData);
      toast({ title: '✓ Saved', description: 'All content has been saved successfully.' });
      reset(data);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save content.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Subcategories Component ──────────────────────
  const Subcategories = ({ categoryIndex }: { categoryIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: control,
      name: `categories.${categoryIndex}.subcategories`,
    });

    return (
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed py-6 flex flex-col items-center text-center">
            <Tag className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No products yet in this category</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const newId = `new-subcat-${Date.now()}`;
                const categorySlugVal = slugify(getValues(`categories.${categoryIndex}.name`));
                append({
                  id: newId, name: '', href: `/category/${categorySlugVal}/`,
                  imageUrl: '', imageUrls: [], imageHint: '', price: undefined, sizes: []
                });
                refreshProductList();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Product
            </Button>
          </div>
        ) : (
          <>
            {fields.map((field, index) => {
              const subName = getValues(`categories.${categoryIndex}.subcategories.${index}.name`);
              return (
                <div key={field.id} className="rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {subName || <span className="text-muted-foreground italic">Unnamed Product</span>}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => {
                          setDeleteDialog({
                            open: true,
                            title: 'Delete Product',
                            description: `Are you sure you want to delete "${subName || 'this product'}"? This action cannot be undone.`,
                            onConfirm: () => { remove(index); refreshProductList(); },
                          });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={control}
                            name={`categories.${categoryIndex}.subcategories.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} onBlur={() => { updateHrefs(categoryIndex, index); refreshProductList(); }} placeholder="Enter name" className="h-9" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`categories.${categoryIndex}.subcategories.${index}.price`}
                            render={({ field: { onChange, value, ...field } }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Price (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number" step="0.01" min="0" placeholder="0.00" className="h-9"
                                    {...field}
                                    defaultValue={value ?? ''}
                                    onChange={(e) => { const val = e.target.value; onChange(val === '' ? undefined : parseFloat(val)); }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={control}
                          name={`categories.${categoryIndex}.subcategories.${index}.href`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">Auto-generated Link</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly className="h-8 bg-muted text-xs font-mono" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <ProductSizes fieldNamePrefix={`categories.${categoryIndex}.subcategories.${index}`} />
                      </div>

                      {/* Multi-image upload (2 photos) */}
                      <FormField
                        control={control}
                        name={`categories.${categoryIndex}.subcategories.${index}.imageUrls`}
                        render={({ field: { onChange, value } }) => (
                          <FormItem>
                            <MultiImageUpload
                              imageUrls={value || []}
                              onChange={onChange}
                              prefix={`subcat-${categoryIndex}-${index}`}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => {
                const newId = `new-subcat-${Date.now()}`;
                const categorySlugVal = slugify(getValues(`categories.${categoryIndex}.name`));
                append({
                  id: newId, name: '', href: `/category/${categorySlugVal}/`,
                  imageUrl: '', imageUrls: [], imageHint: '', price: undefined, sizes: []
                });
                refreshProductList();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </>
        )}
      </div>
    );
  };

  // ─── Loading State ──────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  const heroCount = heroProductFields.length;
  const categoryCount = categoryFields.length;
  const productCount = productList.length;

  // ─── Main Render ──────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your homepage banners, product categories, and catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          {formState.isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
              Unsaved changes
            </Badge>
          )}
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving || !formState.isDirty}
            size="default"
            className="shadow-sm"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: 'banners' as const, icon: Layers, count: heroCount, label: 'Banners' },
          { key: 'categories' as const, icon: FolderOpen, count: categoryCount, label: 'Categories' },
          { key: 'products' as const, icon: Tag, count: productCount, label: 'Products' },
        ].map(({ key, icon: StatIcon, count, label }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab(key)}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(key)}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm cursor-pointer ${activeTab === key ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${activeTab === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <StatIcon className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold leading-none">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="banners">
                <Layers className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Hero </span>Banners
              </TabsTrigger>
              <TabsTrigger value="categories">
                <FolderOpen className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="products">
                <Tag className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* ═══ HERO BANNERS TAB ═══ */}
            <TabsContent value="banners" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Hero Banners</CardTitle>
                      <CardDescription>Featured products displayed on the homepage carousel</CardDescription>
                    </div>
                    <Button type="button" size="sm" onClick={() => appendHero({ productId: '', tagline: '', imageUrl: '', imageHint: '' })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {heroProductFields.length === 0 ? (
                    <EmptyState
                      icon={Layers}
                      title="No hero banners"
                      description="Add hero banners to showcase featured products on your homepage carousel."
                      action={
                        <Button type="button" onClick={() => appendHero({ productId: '', tagline: '', imageUrl: '', imageHint: '' })}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add First Banner
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {heroProductFields.map((field, index) => (
                        <div key={field.id} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all">
                          <FormField
                            control={control}
                            name={`heroProducts.${index}.imageUrl`}
                            render={({ field: { onChange, value } }) => (
                              <ImageUploadZone value={value} onChange={onChange} prefix={`hero-${index}`} />
                            )}
                          />
                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">Banner {index + 1}</Badge>
                              <div className="flex items-center gap-1">
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => moveHero(index, index - 1)} disabled={index === 0}>
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => moveHero(index, index + 1)} disabled={index === heroProductFields.length - 1}>
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeleteDialog({
                                    open: true, title: 'Delete Banner',
                                    description: `Remove Banner ${index + 1}?`,
                                    onConfirm: () => removeHero(index),
                                  })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <FormField
                              control={control}
                              name={`heroProducts.${index}.productId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Linked Product</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select a product" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {productList.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name || p.id}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name={`heroProducts.${index}.tagline`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Tagline</FormLabel>
                                  <FormControl><Input {...field} placeholder="Override product tagline" className="h-9" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <p className="text-[10px] text-muted-foreground">Leave blank to use the product&apos;s original image and tagline</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ CATEGORIES TAB ═══ */}
            <TabsContent value="categories" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Categories</CardTitle>
                      <CardDescription>Organize your products into browsable categories</CardDescription>
                    </div>
                    <Button type="button" size="sm" onClick={() => appendCategory({ id: `new-cat-${Date.now()}`, name: '', href: '', imageUrl: '', imageHint: '', subcategories: [] })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {categoryFields.length === 0 ? (
                    <EmptyState
                      icon={FolderOpen}
                      title="No categories"
                      description="Create categories to organize your products."
                      action={
                        <Button type="button" onClick={() => appendCategory({ id: `new-cat-${Date.now()}`, name: '', href: '', imageUrl: '', imageHint: '', subcategories: [] })}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add First Category
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {categoryFields.map((field, index) => {
                        const catName = getValues(`categories.${index}.name`);
                        const subCount = getValues(`categories.${index}.subcategories`)?.length || 0;
                        return (
                          <div key={field.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-all">
                            <div className="p-4">
                              <div className="flex items-start gap-4">
                                <FormField
                                  control={control}
                                  name={`categories.${index}.imageUrl`}
                                  render={({ field: { onChange, value } }) => (
                                    <FormItem className="shrink-0">
                                      <ImageUploadZone value={value} onChange={onChange} prefix={`category-${index}`} compact />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex-1 min-w-0 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 space-y-3">
                                      <FormField control={control} name={`categories.${index}.name`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-xs">Category Name</FormLabel>
                                            <FormControl><Input {...field} onBlur={() => updateHrefs(index)} placeholder="e.g. Laddles, Glasses" className="h-9 font-medium" /></FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField control={control} name={`categories.${index}.href`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-xs text-muted-foreground">Link</FormLabel>
                                            <FormControl><Input {...field} readOnly className="h-8 bg-muted text-xs font-mono" /></FormControl>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1 pt-5">
                                      <Badge variant="outline" className="text-xs shrink-0">{subCount} product{subCount !== 1 ? 's' : ''}</Badge>
                                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0" onClick={() => moveCategory(index, index - 1)} disabled={index === 0}>
                                        <ArrowUp className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0" onClick={() => moveCategory(index, index + 1)} disabled={index === categoryFields.length - 1}>
                                        <ArrowDown className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => setDeleteDialog({
                                          open: true, title: 'Delete Category',
                                          description: `Delete "${catName || 'this category'}" and all its ${subCount} product${subCount !== 1 ? 's' : ''}?`,
                                          onConfirm: () => { removeCategory(index); refreshProductList(); },
                                        })}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ PRODUCTS TAB ═══ */}
            <TabsContent value="products" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Products</CardTitle>
                      <CardDescription>Manage products within each category</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  {categoryFields.length === 0 ? (
                    <EmptyState
                      icon={Tag}
                      title="No categories yet"
                      description="Create categories first before adding products."
                      action={
                        <Button type="button" variant="outline" onClick={() => setActiveTab('categories')}>
                          <FolderOpen className="mr-2 h-4 w-4" /> Go to Categories
                        </Button>
                      }
                    />
                  ) : (
                    <Accordion type="multiple" className="space-y-3">
                      {categoryFields.map((field, index) => {
                        const catName = getValues(`categories.${index}.name`);
                        const catImage = getValues(`categories.${index}.imageUrl`);
                        const subCount = getValues(`categories.${index}.subcategories`)?.length || 0;
                        return (
                          <AccordionItem key={field.id} value={field.id} className="rounded-xl border px-0 overflow-hidden">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                {catImage ? (
                                  <div className="h-8 w-8 rounded-md overflow-hidden relative shrink-0">
                                    <Image src={catImage} alt="" fill className="object-cover" sizes="32px" />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-semibold text-sm">{catName || `Category ${index + 1}`}</span>
                                <Badge variant="secondary" className="text-xs ml-2">{subCount} item{subCount !== 1 ? 's' : ''}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <Subcategories categoryIndex={index} />
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* Floating Save Bar */}
      {formState.isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-full border bg-background/95 backdrop-blur-sm shadow-lg px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium">Unsaved changes</span>
            <Separator orientation="vertical" className="h-5" />
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => { reset(); refreshProductList(); }}>Discard</Button>
            <Button type="button" size="sm" className="h-8 shadow-sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}
