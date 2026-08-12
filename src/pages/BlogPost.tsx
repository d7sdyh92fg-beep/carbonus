import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { ArticleSchema } from "@/components/seo/StructuredData";
import { CalendarDays, Clock3, User, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CarFront } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import blogSavingsTips from "@/assets/blog-savings-tips-final.jpg";
import blogLithuaniaTravel from "/lovable-uploads/1d2b0b23-8949-459d-a4e5-1178e658608a.png";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "/lovable-uploads/7e8ac90d-43ea-4124-b0a3-07cb11da3447.png";
import blogFamilyTravel from "@/assets/blog-family-travel.jpg";
import blogGroupTravel from "@/assets/blog-group-travel.jpg";

interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const isEnglish = language === "en";
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(height > 0 ? Math.min(100, (window.scrollY / height) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  const blogPosts: { [key: string]: BlogPostData } = {
    "10-patarimu-kaip-sutaupyti-nuomojant-automobili": {
      id: "1",
      title: t('blog.posts.savings.title'),
      excerpt: t('blog.posts.savings.excerpt'),
      author: t('blog.posts.savings.author'),
      publishDate: "2025-12-15",
      readTime: t('blog.posts.savings.readTime'),
      category: t('blog.posts.savings.category'),
      image: blogSavingsTips,
      slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili",
      content: t('blogPost.content.savings')
    },
    "kelioniu-po-lietuva-gidas-geriausi-marsrutai": {
      id: "2",
      title: t('blog.posts.travel.title'),
      excerpt: t('blog.posts.travel.excerpt'),
      author: t('blog.posts.travel.author'),
      publishDate: "2025-12-10", 
      readTime: t('blog.posts.travel.readTime'),
      category: t('blog.posts.travel.category'),
      image: blogLithuaniaTravel,
      slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai",
      content: t('blogPost.content.travel')
    },
    "automobiliu-nuomos-draudimas-kas-reikia-zinoti": {
      id: "3",
      title: t('blog.posts.insurance.title'),
      excerpt: t('blog.posts.insurance.excerpt'),
      author: t('blog.posts.insurance.author'), 
      publishDate: "2025-12-05",
      readTime: t('blog.posts.insurance.readTime'),
      category: t('blog.posts.insurance.category'),
      image: blogCarInsurance,
      slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti",
      content: t('blogPost.content.insurance')
    },
    "verslo-keliones-kaip-issirinkti-tinkama-automobili": {
      id: "4",
      title: t('blog.posts.business.title'),
      excerpt: t('blog.posts.business.excerpt'),
      author: t('blog.posts.business.author'),
      publishDate: "2025-11-30",
      readTime: t('blog.posts.business.readTime'),
      category: t('blog.posts.business.category'),
      image: blogBusinessTravel,
      slug: "verslo-keliones-kaip-issirinkti-tinkama-automobili",
      content: t('blogPost.content.business')
    },
    "ziemos-vairavimas-saugumas-kelyje": {
      id: "5",
      title: t('blog.posts.winter.title'),
      excerpt: t('blog.posts.winter.excerpt'),
      author: t('blog.posts.winter.author'),
      publishDate: "2025-11-25",
      readTime: t('blog.posts.winter.readTime'),
      category: t('blog.posts.winter.category'),
      image: blogWinterDriving,
      slug: "ziemos-vairavimas-saugumas-kelyje",
      content: t('blogPost.content.winter')
    },
    "seimos-kelione-kaip-pasirinkti-idealu-automobili": {
      id: "6",
      title: t('blog.posts.family.title'),
      excerpt: t('blog.posts.family.excerpt'),
      author: t('blog.posts.family.author'),
      publishDate: "2025-11-20",
      readTime: t('blog.posts.family.readTime'),
      category: t('blog.posts.family.category'),
      image: blogFamilyTravel,
      slug: "seimos-kelione-kaip-pasirinkti-idealu-automobili",
      content: t('blogPost.content.family')
    },
    "kelione-didelei-grupei-8-vietu-mikroautobusas": {
      id: "7",
      title: t('blog.posts.groupTravel.title'),
      excerpt: t('blog.posts.groupTravel.excerpt'),
      author: t('blog.posts.groupTravel.author'),
      publishDate: "2026-03-30",
      readTime: t('blog.posts.groupTravel.readTime'),
      category: t('blog.posts.groupTravel.category'),
      image: blogGroupTravel.url,
      slug: "kelione-didelei-grupei-8-vietu-mikroautobusas",
      content: t('blogPost.content.groupTravel')
    }
  };

  const post = blogPosts[slug || ""];
  const relatedPosts = Object.values(blogPosts).filter((item) => item.slug !== post?.slug).slice(0, 3);
  const postBase = isEnglish ? "/blog" : "/naujienos";
  const locale = isEnglish ? "en-GB" : "lt-LT";


  if (!post) {
    return (
      <>
        <Helmet>
          <title>{t('blogPost.notFound')} - Carbonus</title>
        </Helmet>
        <div className="flex min-h-screen items-center justify-center bg-[#f7f9f8]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('blogPost.notFound')}</h2>
            <button onClick={() => navigate(postBase)} className="rounded-full bg-[hsl(var(--carbonus-green-dark))] px-6 py-3 text-sm font-bold text-white">
              {t('blogPost.backToNews')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <Helmet>
        <title>{post.title} | Carbonus</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://carbonus.lt/${isEnglish ? "blog" : "naujienos"}/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://carbonus.lt/${isEnglish ? "blog" : "naujienos"}/${post.slug}`} />
        <meta property="og:image" content={post.image} />
      </Helmet>
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        author={post.author}
        datePublished={post.publishDate}
        image={post.image}
        url={`https://carbonus.lt/${isEnglish ? "blog" : "naujienos"}/${post.slug}`}
      />
      <LanguageLinks ltPath={`/naujienos/${post.slug}`} enPath={`/blog/${post.slug}`} />
      <Header />
      <div className="fixed left-0 right-0 top-[76px] z-[55] h-[2px] bg-transparent">
        <div className="h-full bg-[hsl(var(--carbonus-green))] transition-[width] duration-150" style={{ width: `${readingProgress}%` }} />
      </div>

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f2f7f4] pt-[78px]">
          <div className="pointer-events-none absolute -right-40 -top-32 h-[580px] w-[580px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto max-w-[1320px] px-6 pb-14 pt-16 md:px-6 lg:pb-20 lg:pt-20">
            <Link to={postBase} className="inline-flex items-center gap-2 text-[12px] font-bold text-[#64756e] transition hover:text-[hsl(var(--carbonus-green-dark))]">
              <ArrowLeft className="h-4 w-4" />
              {t('blogPost.backToNews')}
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-[hsl(var(--carbonus-green-soft))] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--carbonus-green-dark))]">
                  {post.category}
                </span>
                <h1 className="mt-6 text-[40px] font-bold leading-[1.07] tracking-[-0.045em] sm:text-[42px] lg:text-[50px]">
                  {post.title}
                </h1>
                <p className="mt-6 max-w-[650px] text-[16px] leading-7 text-[#64756e]">
                  {post.excerpt}
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-medium text-[#718279]">
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />{post.author}</span>
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />{new Date(post.publishDate).toLocaleDateString(locale)}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />{post.readTime}</span>
                </div>
              </div>

              <figure className="relative overflow-hidden rounded-[28px] border border-white bg-white p-2 shadow-[0_24px_70px_rgba(11,55,38,0.12)]">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[22px]">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d281f]/45 to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">Carbonus žurnalas</span>
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-14 md:px-6 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,780px)_280px] lg:justify-between">
            <article className="min-w-0 rounded-[28px] border border-[#e0e8e4] bg-white px-6 py-8 shadow-[0_18px_55px_rgba(14,47,35,0.055)] sm:px-10 sm:py-12 lg:px-14">
              <div className="mb-10 border-l-2 border-[hsl(var(--carbonus-green))] pl-5 text-[16px] font-medium leading-7 text-[#40524a]">
                {post.excerpt}
              </div>
              <div
                className="prose max-w-none prose-headings:tracking-[-0.025em] prose-headings:text-[#111b18] prose-h2:mb-5 prose-h2:mt-12 prose-h2:text-[28px] prose-h2:leading-tight prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-[21px] prose-p:my-5 prose-p:text-[15px] prose-p:leading-8 prose-p:text-[#5f7169] prose-a:font-semibold prose-a:text-[hsl(var(--carbonus-green-dark))] prose-strong:text-[#25342f] prose-li:my-2 prose-li:text-[15px] prose-li:leading-7 prose-li:text-[#5f7169] prose-ul:my-6 prose-ol:my-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-12 flex items-center justify-between gap-4 border-t border-[#e3ebe7] pt-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#819089]">Parengė</p>
                  <p className="mt-1 text-[14px] font-bold text-[#25342f]">{post.author}</p>
                </div>
                <Link to={postBase} className="inline-flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--carbonus-green-dark))]">
                  Visi straipsniai <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-[24px] border border-[#e0e8e4] bg-white p-6 shadow-[0_14px_42px_rgba(14,47,35,0.05)]">
                <h2 className="flex items-center gap-2 text-[15px] font-bold"><BookOpen className="h-[18px] w-[18px] text-[hsl(var(--carbonus-green))]" /> Apie straipsnį</h2>
                <div className="mt-5 space-y-4 border-t border-[#e6ece9] pt-5">
                  <InfoRow label={t('blogPost.category')} value={post.category} />
                  <InfoRow label={t('blogPost.readTime')} value={post.readTime} />
                  <InfoRow label={t('blogPost.published')} value={new Date(post.publishDate).toLocaleDateString(locale)} />
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] bg-[hsl(var(--carbonus-green-deep))] p-6 text-white shadow-[0_18px_50px_rgba(1,72,44,0.18)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><CarFront className="h-5 w-5" /></span>
                <h2 className="mt-5 text-[22px] font-bold leading-tight tracking-[-0.025em]">Reikia automobilio?</h2>
                <p className="mt-3 text-[13px] leading-6 text-white/68">Patikrinkite laisvas datas ir išsirinkite jums tinkamą modelį.</p>
                <Link to="/laisvi-automobiliai" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-[12px] font-bold text-[hsl(var(--carbonus-green-deep))] transition hover:bg-[#eef8f3]">
                  Tikrinti automobilius <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-[22px] border border-[#dfe8e3] bg-[#f2f7f4] p-5">
                {["Aiškiai paaiškinta", "Praktiškai pritaikoma", "Parengta Carbonus"].map((item) => (
                  <div key={item} className="flex items-center gap-2 py-1.5 text-[12px] font-semibold text-[#53645d]"><CheckCircle2 className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />{item}</div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="border-t border-[#e0e8e4] bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-[1320px] px-6 md:px-6">
            <div className="mb-9 flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[hsl(var(--carbonus-green-dark))]">Skaitykite toliau</p>
                <h2 className="mt-2 text-[30px] font-bold tracking-[-0.035em] sm:text-[38px]">Jums gali būti naudinga</h2>
              </div>
              <Link to={postBase} className="hidden items-center gap-2 text-[12px] font-bold text-[hsl(var(--carbonus-green-dark))] sm:inline-flex">Visi straipsniai <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link key={item.slug} to={`${postBase}/${item.slug}`} className="group overflow-hidden rounded-[23px] border border-[#e0e8e4] bg-[#f9fbfa] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(14,47,35,0.08)]">
                  <div className="aspect-[16/9] overflow-hidden"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /></div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--carbonus-green-dark))]">{item.category}</p>
                    <h3 className="mt-3 line-clamp-2 text-[18px] font-bold leading-[1.3] tracking-[-0.02em]">{item.title}</h3>
                    <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold text-[hsl(var(--carbonus-green-dark))]">Skaityti <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-[#819089]">{label}</span>
      <span className="text-right text-[12px] font-bold text-[#33443d]">{value}</span>
    </div>
  );
}

export default BlogPost;
