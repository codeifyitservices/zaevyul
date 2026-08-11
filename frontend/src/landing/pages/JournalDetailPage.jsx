import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { api } from "../../lib/api";

export default function JournalDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.blogs.getBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(err.message || "Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    return new Date(dateVal).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1916] font-sans pt-[68px]">
      <Navbar />

      <main className="mx-auto max-w-[900px] px-6 py-12 md:px-12 md:py-16">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B58A5B] hover:text-[#1C1916] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>Back to Journal</span>
        </Link>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#B58A5B] border-t-transparent" />
          </div>
        ) : error || !blog ? (
          <div className="text-center py-20 border border-dashed border-[#E7DED3] bg-white p-8">
            <h2 className="font-serif text-[24px] text-[#1C1916]">Article Not Found</h2>
            <p className="font-sans text-[13px] text-[#1C1916]/60 mt-2">{error}</p>
            <Link
              to="/journal"
              className="mt-6 inline-block bg-[#1C1916] text-white px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
            >
              Return to Journal Index
            </Link>
          </div>
        ) : (
          <article className="bg-white border border-[#E7DED3] p-8 md:p-14 shadow-sm rounded-[2px]">
            {/* Category & Title */}
            <div className="mb-6">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B58A5B]">
                {blog.category || "Heritage & Craft"}
              </span>
              <h1 className="mt-3 font-serif text-[34px] md:text-[46px] font-light leading-[1.15] text-[#1C1916]">
                {blog.title}
              </h1>
            </div>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 border-y border-[#E7DED3] py-4 my-6 text-[12px] text-[#1C1916]/60">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-[#B58A5B]" />
                <span>{blog.authorName || "Zaevyul Editorial"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#B58A5B]" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#B58A5B]" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>
            </div>

            {/* Featured Image */}
            {(blog.featuredImage || blog.mainImage?.url) && (
              <div className="my-8 overflow-hidden rounded-[2px] border border-[#E7DED3]">
                <img
                  src={blog.featuredImage || blog.mainImage?.url}
                  alt={blog.title}
                  className="w-full h-auto max-h-[480px] object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-stone max-w-none text-[#1C1916]/85 font-sans text-[15px] leading-[1.8] space-y-6">
              {blog.content ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <p>{blog.excerpt || "No additional content available for this article."}</p>
              )}
            </div>
          </article>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
