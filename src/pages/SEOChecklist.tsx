import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  Target,
  Users,
  FileText,
  Share2
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  priority: "high" | "medium" | "low";
  timeframe: string;
}

const SEOChecklist = () => {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("seo-checklist");
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id: string) => {
    const newCompleted = completedItems.includes(id)
      ? completedItems.filter(item => item !== id)
      : [...completedItems, id];
    setCompletedItems(newCompleted);
    localStorage.setItem("seo-checklist", JSON.stringify(newCompleted));
  };

  const immediateActions: ChecklistItem[] = [
    {
      id: "google-analytics",
      title: "Sukurti Google Analytics paskyrą",
      description: "Eikite į Admin Panel → Google Analytics ir įveskite Measurement ID",
      link: "https://analytics.google.com/",
      priority: "high",
      timeframe: "30 min"
    },
    {
      id: "search-console",
      title: "Registruotis Google Search Console",
      description: "Pridėkite savo svetainę ir patikrinkite nuosavybę",
      link: "https://search.google.com/search-console/",
      priority: "high",
      timeframe: "20 min"
    },
    {
      id: "submit-sitemap",
      title: "Pateikti Sitemap į Google",
      description: "Search Console → Sitemaps → Įveskite 'sitemap.xml'",
      link: "https://search.google.com/search-console/",
      priority: "high",
      timeframe: "5 min"
    },
    {
      id: "google-business",
      title: "Sukurti Google Business Profile",
      description: "Registruokite verslą Google Maps ir vietinei paieškai",
      link: "https://business.google.com/",
      priority: "high",
      timeframe: "45 min"
    }
  ];

  const weekOneActions: ChecklistItem[] = [
    {
      id: "business-photos",
      title: "Įkelti 10+ nuotraukų į Google Business",
      description: "Automobilių, biuro, komandos nuotraukos",
      priority: "high",
      timeframe: "30 min"
    },
    {
      id: "facebook-page",
      title: "Sukurti Facebook verslo puslapį",
      description: "facebook.com/carbonuslt su pilna informacija",
      link: "https://www.facebook.com/pages/create",
      priority: "medium",
      timeframe: "30 min"
    },
    {
      id: "instagram-account",
      title: "Sukurti Instagram verslo paskyrą",
      description: "@carbonuslt su automobilių nuotraukomis",
      link: "https://www.instagram.com/",
      priority: "medium",
      timeframe: "30 min"
    },
    {
      id: "lithuanian-directories",
      title: "Registruotis 5 Lietuvos kataloge",
      description: "verslo.lt, imones.lt, panorama.lt, europages.lt, kompass.com",
      priority: "medium",
      timeframe: "60 min"
    },
    {
      id: "google-maps",
      title: "Patikrinti Google Maps registraciją",
      description: "Įsitikinkite, kad verslas rodomas žemėlapyje",
      priority: "high",
      timeframe: "10 min"
    }
  ];

  const monthOneActions: ChecklistItem[] = [
    {
      id: "first-blog",
      title: "Publikuoti pirmą blog įrašą",
      description: "Kelionių vadovas po Druskininkų apylinkes",
      priority: "high",
      timeframe: "2 hours"
    },
    {
      id: "get-reviews",
      title: "Gauti 5 Google įvertinimus",
      description: "Prašykite patenkintų klientų palikti atsiliepimus",
      priority: "high",
      timeframe: "Ongoing"
    },
    {
      id: "partner-outreach",
      title: "Susisiekti su 10 viešbučių",
      description: "Pasiūlyti partnerystę ir nuorodų keitimąsi",
      priority: "medium",
      timeframe: "3 hours"
    },
    {
      id: "social-media-posts",
      title: "Publikuoti 12 įrašų socialiniuose tinkluose",
      description: "3x per savaitę Facebook ir Instagram",
      priority: "medium",
      timeframe: "Ongoing"
    },
    {
      id: "whatsapp-business",
      title: "Sukurti WhatsApp Business paskyrą",
      description: "Greitas klientų aptarnavimas per žinutes",
      priority: "low",
      timeframe: "20 min"
    }
  ];

  const ongoingActions: ChecklistItem[] = [
    {
      id: "weekly-blog",
      title: "Rašyti 1 blog įrašą per mėnesį",
      description: "SEO optimizuoti straipsniai su Lietuvos raktažodžiais",
      priority: "high",
      timeframe: "Monthly"
    },
    {
      id: "respond-reviews",
      title: "Atsakyti į visus atsiliepimus",
      description: "Per 24 valandas, profesionaliai",
      priority: "high",
      timeframe: "Daily"
    },
    {
      id: "social-posts",
      title: "3 įrašai per savaitę socialiniuose tinkluose",
      description: "Facebook, Instagram, LinkedIn",
      priority: "medium",
      timeframe: "Weekly"
    },
    {
      id: "monitor-rankings",
      title: "Tikrinti pozicijas Google Search Console",
      description: "Stebėti raktažodžių reitingus",
      priority: "medium",
      timeframe: "Weekly"
    },
    {
      id: "update-photos",
      title: "Atnaujinti Google Business nuotraukas",
      description: "Nauji automobiliai, sezoninės nuotraukos",
      priority: "low",
      timeframe: "Monthly"
    }
  ];

  const calculateProgress = (items: ChecklistItem[]) => {
    const completed = items.filter(item => completedItems.includes(item.id)).length;
    return (completed / items.length) * 100;
  };

  const totalProgress = () => {
    const allItems = [...immediateActions, ...weekOneActions, ...monthOneActions, ...ongoingActions];
    return calculateProgress(allItems);
  };

  const ChecklistSection = ({ items, title }: { items: ChecklistItem[], title: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline">
          {items.filter(i => completedItems.includes(i.id)).length}/{items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className={completedItems.includes(item.id) ? "bg-muted/30" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={`font-medium ${completedItems.includes(item.id) ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.priority === "high" ? "Aukštas" : item.priority === "medium" ? "Vidutinis" : "Žemas"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.timeframe}
                      </span>
                    </div>
                  </div>
                  {item.link && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => window.open(item.link, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Atidaryti nuorodą
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/__l5e/assets-v1/eb52b609-dc60-4b38-b63c-1e1348dc083a/logo-white.png" />
      
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              SEO Optimizacija
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Google SEO Checklist</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sekite šiuos žingsnius, kad jūsų svetainė būtų #1 Google paieškoje
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Bendras progresas
              </CardTitle>
              <CardDescription>
                Užbaigta {completedItems.length} iš {immediateActions.length + weekOneActions.length + monthOneActions.length + ongoingActions.length} užduočių
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={totalProgress()} className="h-3 mb-4" />
              <p className="text-center text-2xl font-bold text-primary">
                {Math.round(totalProgress())}%
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{completedItems.length}</p>
                <p className="text-sm text-muted-foreground">Užbaigta</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Circle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {immediateActions.length + weekOneActions.length + monthOneActions.length + ongoingActions.length - completedItems.length}
                </p>
                <p className="text-sm text-muted-foreground">Liko</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Tikėtini lankytojai/mėn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">6 mėn</p>
                <p className="text-sm text-muted-foreground">Iki #1 pozicijos</p>
              </CardContent>
            </Card>
          </div>

          {/* Checklist Tabs */}
          <Tabs defaultValue="immediate" className="space-y-6">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
              <TabsTrigger value="immediate" className="text-xs sm:text-sm">
                Šiandien
                <Badge variant="secondary" className="ml-2 text-xs">
                  {immediateActions.filter(i => completedItems.includes(i.id)).length}/{immediateActions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="week1" className="text-xs sm:text-sm">
                1 Savaitė
                <Badge variant="secondary" className="ml-2 text-xs">
                  {weekOneActions.filter(i => completedItems.includes(i.id)).length}/{weekOneActions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="month1" className="text-xs sm:text-sm">
                1 Mėnuo
                <Badge variant="secondary" className="ml-2 text-xs">
                  {monthOneActions.filter(i => completedItems.includes(i.id)).length}/{monthOneActions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="text-xs sm:text-sm">
                Nuolatinės
                <Badge variant="secondary" className="ml-2 text-xs">
                  {ongoingActions.filter(i => completedItems.includes(i.id)).length}/{ongoingActions.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="immediate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    Pradėkite šiandien (2 valandos)
                  </CardTitle>
                  <CardDescription>
                    Šios užduotys yra kritiškos ir turėtų būti atliktos pirmą dieną
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection items={immediateActions} title="" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    Pirma savaitė (5 valandos)
                  </CardTitle>
                  <CardDescription>
                    Užbaikite šias užduotis per pirmą savaitę
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection items={weekOneActions} title="" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Pirmas mėnuo (8 valandos)
                  </CardTitle>
                  <CardDescription>
                    Sukurkite turinį ir partnerystes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection items={monthOneActions} title="" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ongoing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-green-500" />
                    Nuolatinės užduotys
                  </CardTitle>
                  <CardDescription>
                    Palaikykite SEO aktyvumą šiomis reguliariomis užduotimis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection items={ongoingActions} title="" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Resources */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Naudingi šaltiniai</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => window.open("https://analytics.google.com/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Google Analytics</div>
                  <div className="text-xs text-muted-foreground">Stebėkite lankytojus</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => window.open("https://search.google.com/search-console/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Google Search Console</div>
                  <div className="text-xs text-muted-foreground">Stebėkite SEO</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => window.open("https://business.google.com/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Google Business Profile</div>
                  <div className="text-xs text-muted-foreground">Valdykite verslą Maps</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => window.open("/admin", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Admin Dashboard</div>
                  <div className="text-xs text-muted-foreground">Valdykite Google Analytics</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SEOChecklist;
