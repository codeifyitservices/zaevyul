import BlogCategory from "../model/BlogCategory.js";
import Blog from "../model/Blog.js";

const categoriesData = [
  { name: "Heritage" },
  { name: "Craft" },
  { name: "Culture" },
  { name: "Stories" },
  { name: "Care" }
];

const blogsData = [
  {
    title: "The Timeless Legacy of Pashmina",
    slug: "the-timeless-legacy-of-pashmina",
    excerpt: "Discover the rich history of Pashmina, its royal past and how it became a symbol of timeless luxury.",
    content: "<p>Discover the rich history of Pashmina, its royal past and how it became a symbol of timeless luxury.</p>",
    status: "published",
    category: "Heritage",
    readTime: "5 min read",
    mainImage: { url: "/storefront/story-bg.png" },
    featuredImage: "/storefront/story-bg.png",
    publishedAt: new Date("2025-05-10")
  },
  {
    title: "The Art of Handwoven Pashmina",
    slug: "the-art-of-handwoven-pashmina",
    excerpt: "Every weave tells a story. Explore the intricate process and the skilled hands behind every Zaevyul piece.",
    content: "<p>Every weave tells a story. Explore the intricate process and the skilled hands behind every Zaevyul piece.</p>",
    status: "published",
    category: "Craft",
    readTime: "6 min read",
    mainImage: { url: "/storefront/artisan.png" },
    featuredImage: "/storefront/artisan.png",
    publishedAt: new Date("2025-05-05")
  },
  {
    title: "Kashmir: Where Beauty Inspires Creation",
    slug: "kashmir-where-beauty-inspires-creation",
    excerpt: "From its breathtaking landscapes to its vibrant traditions, Kashmir continues to inspire our creations.",
    content: "<p>From its breathtaking landscapes to its vibrant traditions, Kashmir continues to inspire our creations.</p>",
    status: "published",
    category: "Culture",
    readTime: "4 min read",
    mainImage: { url: "/storefront/cat-shawls.png" },
    featuredImage: "/storefront/cat-shawls.png",
    publishedAt: new Date("2025-04-28")
  },
  {
    title: "Woven with Love, Meant to be Cherished",
    slug: "woven-with-love-meant-to-be-cherished",
    excerpt: "The emotions, stories and traditions woven into every Zaevyul Pashmina piece.",
    content: "<p>The emotions, stories and traditions woven into every Zaevyul Pashmina piece.</p>",
    status: "published",
    category: "Stories",
    readTime: "4 min read",
    mainImage: { url: "/storefront/color-palette.png" },
    featuredImage: "/storefront/color-palette.png",
    publishedAt: new Date("2025-04-20")
  },
  {
    title: "Caring for Your Pashmina",
    slug: "caring-for-your-pashmina",
    excerpt: "Simple tips to keep your Pashmina soft, beautiful and timeless for generations to come.",
    content: "<p>Simple tips to keep your Pashmina soft, beautiful and timeless for generations to come.</p>",
    status: "published",
    category: "Care",
    readTime: "3 min read",
    mainImage: { url: "/storefront/prod-stack.png" },
    featuredImage: "/storefront/prod-stack.png",
    publishedAt: new Date("2025-04-15")
  },
  {
    title: "Pashmina Across the World",
    slug: "pashmina-across-the-world",
    excerpt: "From royal courts to modern wardrobes, see how Pashmina remains a global symbol of elegance.",
    content: "<p>From royal courts to modern wardrobes, see how Pashmina remains a global symbol of elegance.</p>",
    status: "published",
    category: "Heritage",
    readTime: "5 min read",
    mainImage: { url: "/storefront/hero.png" },
    featuredImage: "/storefront/hero.png",
    publishedAt: new Date("2025-04-08")
  }
];

export const seedDatabase = async () => {
  try {
    const categoryCount = await BlogCategory.countDocuments();
    if (categoryCount === 0) {
      await BlogCategory.insertMany(categoriesData);
      console.log("Blog categories seeded successfully!");
    }

    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany(blogsData);
      console.log("Blog posts seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
