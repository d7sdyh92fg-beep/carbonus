import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import blogSavingsTips from "@/assets/blog-savings-tips-new.jpg";
import blogLithuaniaTravel from "@/assets/blog-lithuania-travel.jpg";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "@/assets/blog-winter-driving.jpg";
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

  useEffect(() => {
    // Set page title and meta tags
    document.title = "Naujienos - Carbonus | Automobilių nuomos patarimai ir kelionių gidas";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Skaitykite Carbonus naujienas apie automobilių nuomą, kelionių patarimus, vairavimo gudrybes ir naujausias automobilių pramonės žinias Lietuvoje.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/blogas');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Naujienos - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/blogas');
    }
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "10 patarimų, kaip sutaupyti nuomojant automobilį Lietuvoje",
      excerpt: "Sužinokite, kaip gauti geriausią kainą automobilių nuomai ir išvengti paslėptų mokesčių. Praktiniai patarimai ekonomiškam kelionių planavimui.",
      content: "",
      author: "Carbonus komanda",
      publishDate: "2024-12-15",
      readTime: "5 min",
      category: "Patarimai",
      image: blogSavingsTips,
      slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili"
    },
    {
      id: "2", 
      title: "Kelionių po Lietuvą gidas: geriausi maršrutai su nuomotu automobiliu",
      excerpt: "Atraskite nuostabiausius Lietuvos kampus su mūsų sudarytu kelionių gidu. Nuo Kuršių nerijos iki Aukštaitijos nacionalinio parko.",
      content: "",
      author: "Carbonus komanda", 
      publishDate: "2024-12-10",
      readTime: "8 min",
      category: "Kelionės",
      image: blogLithuaniaTravel,
      slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai"
    },
    {
      id: "3",
      title: "Automobilių nuomos draudimas: kas reikia žinoti?",
      excerpt: "Viskas, ką turite žinoti apie automobilių nuomos draudimą Lietuvoje. KASKO, OSAGO ir papildomo draudimo ypatumai.",
      content: "",
      author: "Carbonus komanda",
      publishDate: "2024-12-05", 
      readTime: "6 min",
      category: "Draudimas",
      image: blogCarInsurance,
      slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti"
    },
    {
      id: "4",
      title: "Verslo kelionės: kaip išsirinkti tinkamą automobilį?",
      excerpt: "Praktiniai patarimai verslui, kaip pasirinkti automobilį komandiruotėms ir susitikimams. Ekonomiškumas vs komfortas.",
      content: "",
      author: "Carbonus komanda",
      publishDate: "2024-11-30",
      readTime: "4 min", 
      category: "Verslas",
      image: blogBusinessTravel,
      slug: "verslo-keliones-kaip-issirinkti-tinkama-automobili"
    },
    {
      id: "5",
      title: "Žiemos vairavimas: saugumas kelyje su nuomotu automobiliu",
      excerpt: "Svarbiausios žiemos vairavimo taisyklės ir patarimai, kaip išlaikyti saugumą vairuojant nuomotą automobilį šaltuoju metų laiku.",
      content: "",
      author: "Carbonus komanda", 
      publishDate: "2024-11-25",
      readTime: "7 min",
      category: "Saugumas",
      image: blogWinterDriving,
      slug: "ziemos-vairavimas-saugumas-kelyje"
    },
    {
      id: "6", 
      title: "Šeimos kelionė: kaip pasirinkti idealų automobilį vaikams",
      excerpt: "Geriausių šeimos automobilių apžvalga nuomai. Saugumas, erdvumas ir patogumas keliaujant su vaikais.",
      content: "",
      author: "Carbonus komanda",
      publishDate: "2024-11-20",
      readTime: "5 min",
      category: "Šeima", 
      image: blogFamilyTravel,
      slug: "seimos-kelione-kaip-pasirinkti-idealu-automobili"
    }
  ];

  const categories = ["Visi", "Patarimai", "Kelionės", "Draudimas", "Verslas", "Saugumas", "Šeima"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              CARBONUS NAUJIENOS
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Automobilių nuomos naujienos
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Naujausi patarimai, kelionių gidai ir automobilių pramonės žinios. 
              Visa, kas reikia žinoti apie automobilių nuomą Lietuvoje.
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
                onClick={() => navigate(`/blogas/${post.slug}`)}
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
                        Skaityti <ArrowRight className="w-4 h-4 ml-1" />
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