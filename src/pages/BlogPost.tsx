import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";

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

  const blogPosts: { [key: string]: BlogPostData } = {
    "10-patarimu-kaip-sutaupyti-nuomojant-automobili": {
      id: "1",
      title: "10 patarimų, kaip sutaupyti nuomojant automobilį Lietuvoje",
      excerpt: "Sužinokite, kaip gauti geriausią kainą automobilių nuomai ir išvengti paslėptų mokesčių.",
      author: "Carbonus komanda",
      publishDate: "2024-12-15",
      readTime: "5 min",
      category: "Patarimai",
      image: "/lovable-uploads/12ed3116-e98d-49d4-b5ab-305e8550f33e.png",
      slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili",
      content: `
        <h2>Kodėl verta sutaupyti nuomojant automobilį?</h2>
        <p>Automobilių nuoma gali būti brangi, tačiau su tinkamais patarimais galite smarkiai sumažinti savo išlaidas. Štai 10 praktinių patarimų, kurie padės sutaupyti pinigų.</p>
        
        <h3>1. Rezervuokite iš anksto</h3>
        <p>Ankstyvas rezervavimas dažnai reiškia geresnę kainą. Rekomenduojame rezervuoti automobilį bent 2-3 savaites prieš kelionę.</p>
        
        <h3>2. Palyginkite kainas</h3>
        <p>Neskubėkite rinktis pirmą pasiūlymą. Palyginkite kainas skirtingose nuomos įmonėse ir interneto platformose.</p>
        
        <h3>3. Rinkitės tinkamą automobilio tipą</h3>
        <p>Neperpleskite - jei keliaujate vienas ar du, nebūtinai reikia didelio SUV. Mažesnis automobilis = mažesnės išlaidos.</p>
        
        <h3>4. Atidžiai skaitykite sutartį</h3>
        <p>Paslėpti mokesčiai gali smarkiai padidinti galutinę kainą. Visada atidžiai skaitykite sutarties sąlygas.</p>
        
        <h3>5. Atsivežkite pilną baką</h3>
        <p>Jei galite, grąžinkite automobilį su pilnu kuro baku. Nuomos įmonės kuro kainos dažnai būna aukštesnės.</p>
        
        <h3>6. Paimkite automobilio nuotraukas</h3>
        <p>Prieš išvažiuojant nufotografuokite visus pažeidimus. Tai apsaugos nuo papildomų mokesčių.</p>
        
        <h3>7. Tikrinkite draudimo pasiūlymus</h3>
        <p>Kartais jūsų asmeninis draudimas ar kredito kortelės draudimas padengia nuomos automobilį.</p>
        
        <h3>8. Išvenkite oro uosto nuomos</h3>
        <p>Oro uostų nuomos punktai dažnai būna brangesni dėl papildomų mokesčių ir patogumų.</p>
        
        <h3>9. Pailginkite nuomos laikotarpį</h3>
        <p>Savaitės ar mėnesio nuoma dažnai būna pigesnė už dienų skaičiavimą atskirai.</p>
        
        <h3>10. Naudokitės lojalumo programomis</h3>
        <p>Dažniai nuomojantys klientai gali gauti nuolaidų ir specialių pasiūlymų.</p>
        
        <h2>Išvada</h2>
        <p>Sutaupyti nuomojant automobilį yra įmanoma, jei seksite šiuos paprastus patarimus. Carbonus siūlo skaidrias kainas be paslėptų mokesčių - rezervuokite šiandien!</p>
      `
    },
    "kelioniu-po-lietuva-gidas-geriausi-marsrutai": {
      id: "2",
      title: "Kelionių po Lietuvą gidas: geriausi maršrutai su nuomotu automobiliu",
      excerpt: "Atraskite nuostabiausius Lietuvos kampus su mūsų sudarytu kelionių gidu.",
      author: "Carbonus komanda",
      publishDate: "2024-12-10", 
      readTime: "8 min",
      category: "Kelionės",
      image: "/lovable-uploads/1962d72f-6e8b-4109-9189-e0f8b4dfe195.png",
      slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai",
      content: `
        <h2>Lietuvos grožybės laukia jūsų</h2>
        <p>Lietuva gali ir nedidelė šalis, tačiau čia rasite neįtikėtinų gamtos vaizdų, istorinių vietų ir kultūros paminklų. Su nuomotu automobiliu galėsite lankyti vietas savo tempu.</p>
        
        <h3>Maršrutas #1: Kuršių nerijos ekspedicija (2-3 dienos)</h3>
        <p><strong>Atstumas:</strong> ~400 km iš Vilniaus</p>
        <p><strong>Rekomenduojamas automobilis:</strong> SUV (smėlio keliams)</p>
        <ul>
          <li>Klaipėda - pradėkite nuo uosto miesto</li>
          <li>Smiltynė - keltas į Kuršių neriją</li>
          <li>Juodkrantė - Raganų kalnas</li>
          <li>Nida - Thomas Mann namelis, Parnidžio kopa</li>
        </ul>
        
        <h3>Maršrutas #2: Aukštaitijos nacionalinis parkas (2 dienos)</h3>
        <p><strong>Atstumas:</strong> ~200 km iš Vilniaus</p>
        <p><strong>Rekomenduojamas automobilis:</strong> Universalas (daiktams)</p>
        <ul>
          <li>Ignalina - bazė prie ežerų</li>
          <li>Ladakalnis - gražiausi vaizdai</li>
          <li>Ginučiai - vandens malūnas</li>
          <li>Palūšė - gamtos centras</li>
        </ul>
        
        <h3>Maršrutas #3: Žemaitijos kalvos (1-2 dienos)</h3>
        <p><strong>Atstumas:</strong> ~250 km iš Vilniaus</p>
        <p><strong>Rekomenduojamas automobilis:</strong> Sedanas (patogūs keliai)</p>
        <ul>
          <li>Plungė - Oginskių rūmai</li>
          <li>Žemaičių Kalvarija - piligrimų kelias</li>
          <li>Šateikiai - aukščiausias Žemaitijos taškas</li>
        </ul>
        
        <h3>Maršrutas #4: Dzūkijos miškai ir Druskininkai (2 dienos)</h3>
        <p><strong>Atstumas:</strong> ~150 km iš Vilniaus</p>
        <p><strong>Rekomenduojamas automobilis:</strong> Bet kuris</p>
        <ul>
          <li>Druskininkai - SPA ir poilsis</li>
          <li>Grūto parkas - sovietų skulptūrų muziejus</li>
          <li>Dzūkijos nacionalinis parkas - pažintiniai takai</li>
        </ul>
        
        <h3>Praktiniai patarimai kelionėms</h3>
        <h4>Ką pasiimti su savimi:</h4>
        <ul>
          <li>GPS navigaciją ar telefono programėlę</li>
          <li>Lietaus skėtį (oras Lietuvoje nepastovus)</li>
          <li>Termosą su karšta arbata</li>
          <li>Fotoaparatą gražių vaizdų fiksuoti</li>
        </ul>
        
        <h4>Geriausi metų laikai kelionėms:</h4>
        <ul>
          <li><strong>Pavasaris (balandis-gegužė):</strong> Žydintys medžiai, mažiau turistų</li>
          <li><strong>Vasara (birželis-rugpjūtis):</strong> Šiltas oras, visos atrakcijos veikia</li>
          <li><strong>Ruduo (rugsėjis-spalis):</strong> Auksiniai lapai, ramiau</li>
        </ul>
        
        <h2>Kodėl rinktis Carbonus kelionėms po Lietuvą?</h2>
        <p>Mūsų automobiliai idealiai tinka Lietuvos keliams. Siūlome GPS navigaciją, visą reikiamą draudimą ir 24/7 pagalbą kelyje. Rezervuokite dabar ir pradėkite savo Lietuvos tyrimų nuotykį!</p>
      `
    },
    "automobiliu-nuomos-draudimas-kas-reikia-zinoti": {
      id: "3",
      title: "Automobilių nuomos draudimas: kas reikia žinoti?",
      excerpt: "Viskas, ką turite žinoti apie automobilių nuomos draudimą Lietuvoje.",
      author: "Carbonus komanda", 
      publishDate: "2024-12-05",
      readTime: "6 min",
      category: "Draudimas",
      image: "/lovable-uploads/1bd704ad-6405-4654-b8c9-c47106be98df.png",
      slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti",
      content: `
        <h2>Draudimo pagrindai nuomojant automobilį</h2>
        <p>Automobilių nuomos draudimas - viena svarbiausių temų, kurias būtina suprasti prieš išsinuomodami automobilį. Tinkamas draudimas apsaugo ne tik jus, bet ir jūsų piniginę.</p>
        
        <h3>Privalomas OSAGO draudimas</h3>
        <p>Lietuvoje kiekvienas transporto priemonės valdytojas privalo turėti OSAGO draudimą. Nuomojant automobilį:</p>
        <ul>
          <li>OSAGO draudimas visada įtrauktas į nuomos kainą</li>
          <li>Dengiamos trečiųjų asmenų žalos</li>
          <li>Maksimali išmoka - 6 mln. eurų už žalą sveikatai, 1,2 mln. eurų už turtinę žalą</li>
        </ul>
        
        <h3>KASKO draudimas - papildoma apsauga</h3>
        <p>KASKO draudimas nėra privalomas, bet labai rekomenduojamas:</p>
        <ul>
          <li><strong>Visapusiškas KASKO</strong> - dengia beveik visus pažeidimus</li>
          <li><strong>Dalinis KASKO</strong> - dengia tik tam tikrus atvejus (vagystė, gaisras, kt.)</li>
          <li><strong>Savaimės rizikos</strong> - franšizė, kurią mokate patys</li>
        </ul>
        
        <h3>Kas dengiama standartinio draudimo?</h3>
        <h4>OSAGO dengia:</h4>
        <ul>
          <li>Žalą tretiesiems asmenims</li>
          <li>Medicinos išlaidas nukentėjusiems</li>
          <li>Trečiųjų asmenų turto žalą</li>
        </ul>
        
        <h4>KASKO dengia:</h4>
        <ul>
          <li>Automobilio remonto išlaidas</li>
          <li>Automobilio vagystę</li>
          <li>Gamtos stichijų padarytą žalą</li>
          <li>Vandalizmo atvejus</li>
        </ul>
        
        <h3>Ko nedengia standartinis draudimas?</h3>
        <p>Svarbu žinoti draudimo apribojimus:</p>
        <ul>
          <li>Asmeniniai daiktai automobilyje</li>
          <li>Žala, padaryta būnant neblaiviam</li>
          <li>Žala nuo neleistinų veiksmų</li>
          <li>Padangų ir diskų žala (jei ne dėl avarijos)</li>
          <li>Salono žala (dėmės, kvapai)</li>
        </ul>
        
        <h3>Papildomo draudimo tipai</h3>
        <h4>Sumažintos savaimės rizikos draudimas</h4>
        <p>Sumažina sumą, kurią turėtumėte mokėti iš savo kišenės žalos atveju.</p>
        
        <h4>Pagalbos kelyje draudimas</h4>
        <p>24/7 techninė pagalba, jei automobilis suges ar neužsives.</p>
        
        <h4>Asmeninių daiktų draudimas</h4>
        <p>Dengia jūsų asmeninių daiktų vagystę iš automobilio.</p>
        
        <h3>Kaip elgtis žalos atveju?</h3>
        <ol>
          <li><strong>Saugumas pirmiausia</strong> - įsitikinkite, kad visi saugūs</li>
          <li><strong>Iškvieskite policiją</strong> - būtina sunkių avarijų atveju</li>
          <li><strong>Dokumentuokite žalą</strong> - fotografuokite automobilį ir aplinką</li>
          <li><strong>Susisiekite su nuomos įmone</strong> - pranešite apie incidentą</li>
          <li><strong>Užpildykite dokumentus</strong> - tiksliai ir sąžiningai</li>
        </ol>
        
        <h3>Carbonus draudimo sprendimai</h3>
        <p>Mes siūlome:</p>
        <ul>
          <li>Visapusišką KASKO draudimą visoms automobilių klasėms</li>
          <li>24/7 pagalbą kelyje visoje Lietuvoje</li>
          <li>Greitą žalos surašymą ir apdorojimą</li>
          <li>Skaidrias sąlygas be paslėptų mokesčių</li>
        </ul>
        
        <h2>Patarimai tinkamam draudimui pasirinkti</h2>
        <ul>
          <li>Visuomet skaitykite draudimo sąlygas atidžiai</li>
          <li>Klauskite apie savaimės rizikos dydį</li>
          <li>Įsitikinkite, kad suprantate, kas dengiama ir kas ne</li>
          <li>Apsvarstykite papildomo draudimo poreikį</li>
        </ul>
        
        <p>Tinkamas draudimas užtikrina ramią kelionę. Su Carbonus galite būti tikri, kad esate tinkamai apsaugoti!</p>
      `
    }
  };

  const post = blogPosts[slug || ""];

  useEffect(() => {
    if (post) {
      // Set page title and meta tags dynamically
      document.title = `${post.title} - Carbonus blogas`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
      
      // Update canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', `https://carbonus.lt/blogas/${post.slug}`);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', post.title);
      }
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', `https://carbonus.lt/blogas/${post.slug}`);
      }
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Straipsnis nerastas</h2>
          <Button onClick={() => navigate("/blogas")}>
            Grįžti į blogą
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Breadcrumb */}
      <section className="pt-24 pb-6 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/blogas")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Grįžti į blogą
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
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishDate).toLocaleDateString('lt-LT')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
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
                <CardContent className="p-8">
        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6 prose-h4:text-lg prose-h4:font-semibold prose-h4:mb-2 prose-h4:mt-4 prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1"
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
                    Straipsnio info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kategorija:</span>
                      <div className="font-semibold text-foreground">{post.category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Skaitymo laikas:</span>
                      <div className="font-semibold text-foreground">{post.readTime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Publikuota:</span>
                      <div className="font-semibold text-foreground">
                        {new Date(post.publishDate).toLocaleDateString('lt-LT')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full flex items-center gap-2"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: post.title,
                            text: post.excerpt,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Pasidalinti
                    </Button>
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