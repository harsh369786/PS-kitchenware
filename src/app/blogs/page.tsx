import { getBlogContent } from "@/lib/blog-content";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

export const metadata = {
  title: 'Blogs | PS Kitchenware',
  description: 'Read the latest trends, tips, and news about kitchenware.',
};

export default async function BlogsPage() {
  const content = await getBlogContent();
  
  // Filter only published blogs and sort by rank (higher rank first) then date
  const blogs = (content.blogs || [])
    .filter(b => b.status === 'published')
    .sort((a, b) => {
      if (a.rank !== b.rank) {
         return b.rank - a.rank;
      }
      return new Date(b.publishDate || Date.now()).getTime() - new Date(a.publishDate || Date.now()).getTime();
    });

  if (blogs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Our Blogs</h1>
        <p className="text-muted-foreground">No blogs have been published yet. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Blogs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Discover the latest trends, expert tips, and inspiration for your kitchen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {blog.imageUrl ? (
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1 p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                {blog.category && <span className="uppercase tracking-wider font-semibold text-primary">{blog.category}</span>}
                {blog.category && <span>•</span>}
                <span>{blog.publishDate ? format(new Date(blog.publishDate), 'MMM d, yyyy') : ''}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-muted-foreground flex-1 line-clamp-3 mb-4">
                {blog.shortDescription}
              </p>
              <div className="mt-auto font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Read Article <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
