import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, Newspaper } from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslations } from "@/hooks/use-translations";
import blogSavingsTips from "@/assets/blog-savings-tips-final.jpg";
import blogLithuaniaTravel from "/lovable-uploads/1d2b0b23-8949-459d-a4e5-1178e658608a.png";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "/lovable-uploads/7e8ac90d-43ea-4124-b0a3-07cb11da3447.png";
import blogFamilyTravel from "@/assets/blog-family-travel.jpg";
import blogGroupTravel from "@/assets/citroen-druskininkai-v3.png";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

const Blog = () => {
  const { t, language } = useTranslations();
  const isEnglish = language === "en";
  const [activeCategory, setActiveCategory] = useState("all");

  const blogPosts: BlogPost[] = [
    { id: "7", title: t("blog.posts.groupTravel.title"), excerpt: t("blog.posts.groupTravel.excerpt"), author: t("blog.author"), publishDate: "2026-03-30", readTime: `6 ${t("blog.readTime")}`, category: t("blog.posts.groupTravel.category"), image: blogGroupTravel, slug: "kelione-didelei-grupei-8-vietu-mikroautobusas" },
    { id: "1", title: t("blog.posts.savings.title"), excerpt: t("blog.posts.savings.excerpt"), author: t("blog.author"), publishDate: "2025-12-15", readTime: `5 ${t("blog.readTime")}`, category: t("blog.posts.savings.category"), image: blogSavingsTips, slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili" },
    { id: "2", title: t("blog.posts.travel.title"), excerpt: t("blog.posts.travel.excerpt"), author: t("blog.author"), publishDate: "2025-12-10", readTime: `8 ${t("blog.readTime")}`, category: t("blog.posts.travel.category"), image: blogLithuaniaTravel, slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai" },
    { id: "3", title: t("blog.posts.insurance.title"), excerpt: t("blog.posts.insurance.excerpt"), author: t("blog.author"), publishDate: "2025-12-05", readTime: `6 ${t("blog.readTime")}`, category: t("blog.posts.insurance.category"), image: blogCarInsurance, slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti" },
    { id: "4", title: t("blog.posts.business.title"), excerpt: t("blog.posts.business.excerpt"), author: t("blog.author"), publishDate: "2025-11-30", readTime: `4 ${t("blog.readTime")}`, category: t("blog.posts.business.category"), image: blogBusinessTravel, slug: "verslo-keliones-kaip-issirinkti-tinkama-automobili" },
    { id: "5", title: t("blog.posts.winter.title"), excerpt: t("blog.posts.winter.excerpt"), author: t("blog.author"), publishDate: "2025-11-25", readTime: `7 ${t("blog.readTime")}`, category: t("blog.posts.winter.category"), image: blogWinterDriving, slug: "ziemos-vairavimas-saugumas-kelyje" },
    { id: "6", title: t("blog.posts.family.title"), excerpt: t("blog.posts.family.excerpt"), author: t("blog.author"), publishDate: "2025-11-20", readTime: `5 ${t("blog.readTime")}`, category: t("blog.posts.family.category"), image: blogFamilyTravel, slug: "seimos-kelione-kaip-pasirinkti-idealu-automobili" },
  ];

  const categories = useMemo(() => Array.from(new Set(blogPosts.map((post) => post.category))), [blogPosts]);
  const visiblePosts = activeCategory === "all" ? blogPosts : blogPosts.filter((post) => post.category === activeCategory);
  const featured = visiblePosts[0];
  const remaining = visiblePosts.slice(1);
  const postBase = isEnglish ? "/blog" : "/naujienos";

  const copy = isEnglish
    ? {
        eyebrow: "CARBONUS JOURNAL",
        title: "Useful knowledge for drivers",
        subtitle: "Clear advice about car rental, safe driving and discovering Lithuania by car.",
        all: "All articles",
        featured: "Featured",
        latest: "Latest articles",
        latestText: "Practical answers and ideas prepared by the Carbonus team.",
      }
    : {
        eyebrow: "CARBONUS ŽURNALAS",
        title: "Naudingos žinios vairuotojams",
        subtitle: "Aiškūs patarimai apie automobilių nuomą, saugų vairavimą ir Lietuvos pažinimą automobiliu.",
        all: "Visi straipsniai",
        featured: "Rekomenduojame",
        latest: "Naujausi straipsniai",
        latestText: "Praktiški atsakymai ir idėjos, parengtos Carbonus komandos.",
      };

  const locale = isEnglish ? "en-GB" : "lt-LT";

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead title={isEnglish ? "Car rental tips and guides | Carbonus" : "Patarimai ir gidas | Carbonus"} description={copy.subtitle} canonical={`https://carbonus.lt/${isEnglish ? "blog" : "naujienos"}`} keywords="automobilių nuomos patarimai, vairavimo gidas, kelionės Lietuvoje, Carbonus" />
      <LanguageLinks ltPath="/naujienos" enPath="/blog" />
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
          <div className="pointer-events-none absolute -right-40 -top-44 h-[600px] w-[600px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto max-w-[1280px] px-6 pb-3 pt-16 md:px-10 lg:pt-20">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-[820px] text-[42px] font-bold leading-[1.04] tracking-[-0.045em] sm:text-[54px] lg:text-[66px]">{copy.title}</h1>
            <p className="mt-6 max-w-[680px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">{copy.subtitle}</p>
            <div className="mt-9 flex gap-2 overflow-x-auto pb-2">
              <button type="button" onClick={() => setActiveCategory("all")} className={`h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition ${activeCategory === "all" ? "bg-[hsl(var(--carbonus-green-dark))] text-white" : "border border-[#dce6e1] bg-white text-[#53645d]"}`}>{copy.all}</button>
              {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition ${activeCategory === category ? "bg-[hsl(var(--carbonus-green-dark))] text-white" : "border border-[#dce6e1] bg-white text-[#53645d]"}`}>{category}</button>)}
            </div>
          </div>
        </section>

        {featured && (
          <section className="mx-auto max-w-[1280px] px-6 py-14 md:px-10 lg:py-20">
            <Link to={`${postBase}/${featured.slug}`} className="group grid overflow-hidden rounded-[30px] border border-[#e0e8e4] bg-white shadow-[0_20px_60px_rgba(14,47,35,0.08)] lg:grid-cols-[1.12fr_0.88fr]">
              <div className="relative min-h-[330px] overflow-hidden lg:min-h-[460px]"><img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /><span className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--carbonus-green-dark))] shadow-[0_8px_24px_rgba(12,45,34,0.16)] backdrop-blur-md">{copy.featured}</span></div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--carbonus-green-dark))]">{featured.category}</p>
                <h2 className="mt-4 text-[30px] font-bold leading-[1.15] tracking-[-0.035em] sm:text-[38px]">{featured.title}</h2>
                <p className="mt-5 text-[14px] leading-7 text-[#687a72]">{featured.excerpt}</p>
                <div className="mt-7 flex flex-wrap gap-4 text-[12px] text-[#7b8b84]"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(featured.publishDate).toLocaleDateString(locale)}</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{featured.readTime}</span></div>
                <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-bold text-[hsl(var(--carbonus-green-dark))]">{t("blog.readButton")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </section>
        )}

        {remaining.length > 0 && (
          <section className="mx-auto max-w-[1280px] px-6 pb-24 md:px-10 lg:pb-28">
            <div className="mb-9 flex items-end justify-between gap-8"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[hsl(var(--carbonus-green-dark))]">{copy.latest}</p><h2 className="mt-2 text-[29px] font-bold tracking-[-0.03em] sm:text-[36px]">{copy.latestText}</h2></div><Newspaper className="hidden h-8 w-8 text-[hsl(var(--carbonus-green))] sm:block" /></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remaining.map((post) => (
                <Link key={post.id} to={`${postBase}/${post.slug}`} className="group overflow-hidden rounded-[24px] border border-[#e0e8e4] bg-white shadow-[0_14px_42px_rgba(14,47,35,0.055)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(14,47,35,0.1)]">
                  <div className="relative aspect-[16/10] overflow-hidden"><img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /><span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--carbonus-green-dark))] shadow-[0_8px_24px_rgba(12,45,34,0.16)] backdrop-blur-md">{post.category}</span></div>
                  <div className="p-6"><div className="flex gap-4 text-[11px] text-[#819089]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.publishDate).toLocaleDateString(locale)}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{post.readTime}</span></div><h3 className="mt-4 line-clamp-2 text-[20px] font-bold leading-[1.28] tracking-[-0.025em]">{post.title}</h3><p className="mt-3 line-clamp-3 text-[13px] leading-6 text-[#6a7b74]">{post.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--carbonus-green-dark))]">{t("blog.readButton")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <V3Footer />
    </div>
  );
};

export default Blog;
