import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import blogSavingsTips from "@/assets/blog-savings-tips-final.jpg";
import blogLithuaniaTravel from "/lovable-uploads/1d2b0b23-8949-459d-a4e5-1178e658608a.png";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "/lovable-uploads/7e8ac90d-43ea-4124-b0a3-07cb11da3447.png";
import blogFamilyTravel from "@/assets/blog-family-travel.jpg";

interface BlogPost {
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

const Blog = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();

  useEffect(() => {
    // Set page title and meta tags
    document.title = "Patarimai ir gidas - Carbonus | Automobilių nuomos patarimai ir kelionių gidas";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Skaitykite Carbonus patarimus apie automobilių nuomą, kelionių gidus, vairavimo gudrybes ir naudingas žinias Lietuvoje.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/naujienos');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Naujienos - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/naujienos');
    }
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: t('blog.posts.savings.title'),
      excerpt: t('blog.posts.savings.excerpt'),
      content: "",
      author: t('blog.author'),
      publishDate: "2024-12-15",
      readTime: "5 " + t('blog.readTime'),
      category: t('blog.posts.savings.category'),
      image: blogSavingsTips,
      slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili"
    },
    {
      id: "2", 
      title: t('blog.posts.travel.title'),
      excerpt: t('blog.posts.travel.excerpt'),
      content: "",
      author: t('blog.author'), 
      publishDate: "2024-12-10",
      readTime: "8 " + t('blog.readTime'),
      category: t('blog.posts.travel.category'),
      image: blogLithuaniaTravel,
      slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai"
    },
    {
      id: "3",
      title: t('blog.posts.insurance.title'),
      excerpt: t('blog.posts.insurance.excerpt'),
      content: "",
      author: t('blog.author'),
      publishDate: "2024-12-05", 
      readTime: "6 " + t('blog.readTime'),
      category: t('blog.posts.insurance.category'),
      image: blogCarInsurance,
      slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti"
    },
    {
      id: "4",
      title: t('blog.posts.business.title'),
      excerpt: t('blog.posts.business.excerpt'),
      content: "",
      author: t('blog.author'),
      publishDate: "2024-11-30",
      readTime: "4 " + t('blog.readTime'), 
      category: t('blog.posts.business.category'),
      image: blogBusinessTravel,
      slug: "verslo-keliones-kaip-issirinkti-tinkama-automobili"
    },
    {
      id: "5",
      title: t('blog.posts.winter.title'),
      excerpt: t('blog.posts.winter.excerpt'),
      content: "",
      author: t('blog.author'), 
      publishDate: "2024-11-25",
      readTime: "7 " + t('blog.readTime'),
      category: t('blog.posts.winter.category'),
      image: blogWinterDriving,
      slug: "ziemos-vairavimas-saugumas-kelyje"
    },
    {
      id: "6", 
      title: t('blog.posts.family.title'),
      excerpt: t('blog.posts.family.excerpt'),
      content: "",
      author: t('blog.author'),
      publishDate: "2024-11-20",
      readTime: "5 " + t('blog.readTime'),
      category: t('blog.posts.family.category'), 
      image: blogFamilyTravel,
      slug: "seimos-kelione-kaip-pasirinkti-idealu-automobili"
    }
  ];

  const categories = [
    t('blog.categories.all'),
    t('blog.categories.tips'),
    t('blog.categories.travel'),
    t('blog.categories.insurance'),
    t('blog.categories.business'),
    t('blog.categories.safety'),
    t('blog.categories.family')
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t('blog.badge')}
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-card cursor-pointer"
                onClick={() => navigate(`/naujienos/${post.slug}`)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishDate).toLocaleDateString('lt-LT')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{post.author}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                      >
                        {t('blog.readButton')} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;