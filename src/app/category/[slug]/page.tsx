import { Package } from "lucide-react";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const formatSlug = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center text-center">
        <Package className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold font-headline mb-2">{formatSlug(params.slug)}</h1>
        <p className="text-muted-foreground">Products for this category will be available soon.</p>
      </div>
    </div>
  );
}
