import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, BookOpen } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import blogSavingsTips from "@/assets/blog-savings-tips-final.jpg";
import blogLithuaniaTravel from "/lovable-uploads/1d2b0b23-8949-459d-a4e5-1178e658608a.png";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "/lovable-uploads/7e8ac90d-43ea-4124-b0a3-07cb11da3447.png";
import blogFamilyTravel from "@/assets/blog-family-travel.jpg";
import blogGroupTravel from "@/assets/citroen-druskininkai-v2.png";

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
  const { t } = useTranslations();

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
      image: blogGroupTravel,
      slug: "kelione-didelei-grupei-8-vietu-mikroautobusas",
      content: t('blogPost.content.groupTravel')
    }
  };

  const post = blogPosts[slug || ""];


  if (!post) {
    return (
      <>
        <Helmet>
          <title>{t('blogPost.notFound')} - Carbonus</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('blogPost.notFound')}</h2>
            <Button onClick={() => navigate("/naujienos")}>
              {t('blogPost.backToNews')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} - Carbonus</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://carbonus.lt/naujienos/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://carbonus.lt/naujienos/${post.slug}`} />
        <meta property="og:image" content={post.image} />
      </Helmet>
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Breadcrumb */}
      <section className="pt-24 pb-6 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/naujienos")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-2 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('blogPost.backToNews')}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 bg-primary text-primary-foreground">
              {post.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground mb-8">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 shrink-0" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{new Date(post.publishDate).toLocaleDateString('lt-LT')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardContent className="p-4 sm:p-8">
        <div className="prose prose-sm sm:prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-8 prose-h3:mt-16 prose-h4:text-base sm:prose-h4:text-lg prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-4 prose-p:mb-6 sm:prose-p:mb-12 prose-p:leading-relaxed prose-ul:mb-6 prose-ol:mb-6 prose-li:mb-2"
                     dangerouslySetInnerHTML={{ __html: post.content }}
                   />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-8">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {t('blogPost.articleInfo')}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('blogPost.category')}</span>
                      <div className="font-semibold text-foreground">{post.category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('blogPost.readTime')}</span>
                      <div className="font-semibold text-foreground">{post.readTime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('blogPost.published')}</span>
                      <div className="font-semibold text-foreground">
                        {new Date(post.publishDate).toLocaleDateString('lt-LT')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;