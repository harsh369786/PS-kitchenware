
import type { SiteContent, Product } from "@/lib/types";
import { getSiteContent } from "@/lib/site-content";
import { Search } from "lucide-react";
import CategoryProductGrid from "@/components/category-product-grid";

async function getSearchResults(query: string): Promise<Product[]> {
  if (!query) {
    return [];
  }
  try {
    const content: SiteContent = await getSiteContent();
    const lowerCaseQuery = query.toLowerCase();
    const results: Product[] = [];
    const addedProductIds = new Set<string>();

    content.categories.forEach((category) => {
      // Check category name
      if (category.name.toLowerCase().includes(lowerCaseQuery)) {
        if(!addedProductIds.has(category.id)){
           results.push({
               id: category.id,
               name: category.name,
               imageUrl: category.imageUrl,
               imageHint: category.imageHint || "",
           });
           addedProductIds.add(category.id);
        }
      }

      // Check subcategory names
      if (category.subcategories) {
        category.subcategories.forEach((sub) => {
          if (sub.name.toLowerCase().includes(lowerCaseQuery)) {
            if(!addedProductIds.has(sub.id)){
               results.push({
                id: sub.id,
                name: sub.name,
                imageUrl: sub.imageUrl || category.imageUrl,
                imageHint: sub.imageHint || category.imageHint || "",
              });
              addedProductIds.add(sub.id);
            }
          }
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Failed to fetch site content for search", error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const searchResults = await getSearchResults(query);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-headline mb-4">
        Search Results for "{query}"
      </h1>
      <p className="text-muted-foreground mb-8">
        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}.
      </p>

      {searchResults.length > 0 ? (
        <CategoryProductGrid products={searchResults} />
      ) : (
        <div className="flex flex-col items-center text-center py-16">
          <Search className="w-16 h-16 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-headline mb-2">No results found</h2>
          <p className="text-muted-foreground">
            We couldn't find any products matching your search. Try a different term.
          </p>
        </div>
      )}
    </div>
  );
}
