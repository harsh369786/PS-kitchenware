import { getBlogContent } from "@/lib/blog-content";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const content = await getBlogContent();
  const blog = content.blogs?.find((b) => b.slug === params.slug && b.status === "published");

  if (!blog) {
    return { title: 'Blog Not Found' };
  }

  return {
    title: blog.seoTitle || `${blog.title} | PS Kitchenware`,
    description: blog.seoDescription || blog.shortDescription,
  };
}

export default async function BlogDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const content = await getBlogContent();
  const blog = content.blogs?.find((b) => b.slug === params.slug && b.status === "published");

  if (!blog) {
    notFound();
  }

  const relatedBlogs = content.blogs
    ?.filter(b => b.status === 'published' && b.id !== blog.id)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full relative h-[40vh] md:h-[60vh] bg-muted">
        {blog.featuredImage || blog.imageUrl ? (
          <Image
            src={blog.featuredImage || blog.imageUrl || ''}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary">
             <span className="text-xl">No Featured Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 md:pb-20">
             <Link href="/blogs" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 font-medium transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to all blogs
             </Link>
             <div className="flex items-center gap-3 text-white/90 mb-4 text-sm md:text-base font-medium">
               {blog.category && <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full">{blog.category}</span>}
               <span>{blog.publishDate ? format(new Date(blog.publishDate), 'MMMM d, yyyy') : ''}</span>
             </div>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl tracking-tight leading-tight">
               {blog.title}
             </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Main Content */}
        <div className="flex-1 w-full max-w-4xl lg:max-w-[800px] mx-auto lg:mx-0">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary whitespace-pre-wrap">
              {blog.content}
          </div>
        </div>

        {/* Sidebar / Related Blogs */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <aside className="w-full lg:w-[350px] shrink-0 border-t lg:border-t-0 lg:border-l pt-12 lg:pt-0 lg:pl-12">
            <h3 className="text-2xl font-bold mb-6">More like this</h3>
            <div className="flex flex-col gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <Link href={`/blogs/${relatedBlog.slug}`} key={relatedBlog.id} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
                    {relatedBlog.imageUrl && (
                      <Image
                        src={relatedBlog.imageUrl}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h4 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {relatedBlog.title}
                  </h4>
                  <div className="text-sm text-muted-foreground">
                     {relatedBlog.publishDate ? format(new Date(relatedBlog.publishDate), 'MMM d, yyyy') : ''}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

      </div>
    </article>
  );
}
