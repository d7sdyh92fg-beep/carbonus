import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import blogSavingsTips from "@/assets/blog-savings-tips-final.jpg";
import blogLithuaniaTravel from "/lovable-uploads/1d2b0b23-8949-459d-a4e5-1178e658608a.png";
import blogCarInsurance from "@/assets/blog-car-insurance-new.jpg";
import blogBusinessTravel from "@/assets/blog-business-travel.jpg";
import blogWinterDriving from "/lovable-uploads/7e8ac90d-43ea-4124-b0a3-07cb11da3447.png";
import blogFamilyTravel from "@/assets/blog-family-travel.jpg";

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
      excerpt: "Sužinokite 10 praktiškų patarimų, kaip pigiau išsinuomoti automobilį Lietuvoje. Lyginkite kainas, pasirinkite tinkamą draudimą ir venkite paslėptų mokesčių.",
      author: "Carbonus komanda",
      publishDate: "2024-12-15",
      readTime: "5 min",
      category: "Patarimai",
      image: blogSavingsTips,
      slug: "10-patarimu-kaip-sutaupyti-nuomojant-automobili",
      content: `
        <p>Automobilio nuoma Lietuvoje tampa vis populiaresnė tiek keliautojams, tiek vietiniams gyventojams, kuriems reikia laikino transporto. Tačiau neretai nuomos kaina būna didesnė, nei tikėtasi. Laimei, yra būdų, kaip išvengti permokų ir keliauti pigiau. Štai 10 patarimų, kurie padės sutaupyti.</p>

        <br>

        <h2><strong>1.</strong> Lyginkite automobilių nuomos kainas</h2>
        <p>Prieš priimdami sprendimą, peržiūrėkite kelias skirtingas nuomos įmones. Dažnai už tą patį automobilį vienoje vietoje mokėsite ženkliai pigiau.</p>

        <br>

        <h2><strong>2.</strong> Rezervuokite iš anksto</h2>
        <p>Ankstyva rezervacija užtikrina mažesnę kainą ir didesnį automobilių pasirinkimą, ypač sezono metu.</p>

        <br>

        <h2><strong>3.</strong> Rinkitės ekonomišką automobilio klasę</h2>
        <p>Kompaktiški automobiliai ne tik pigesni nuomai, bet ir sunaudoja mažiau degalų, todėl sutaupysite dvigubai.</p>

        <br>

        <h2><strong>4.</strong> Patikrinkite draudimo sąlygas</h2>
        <p>Dažnai nuomos įmonės siūlo papildomus draudimus. Įsitikinkite, ar jų tikrai reikia – galbūt jūsų kelionių draudimas ar kreditinė kortelė jau apima automobilio nuomą.</p>

        <br>

        <h2><strong>5.</strong> Venkite nuomos punktų oro uostuose</h2>
        <p>Oro uostuose taikomi papildomi mokesčiai. Kartais pigiau išsinuomoti automobilį miesto centre.</p>

        <br>

        <h2><strong>6.</strong> Atkreipkite dėmesį į užstatą</h2>
        <p>Kiekviena nuomos įmonė taiko skirtingą užstato dydį. Įvertinkite, ar tai nebus papildoma našta jūsų biudžetui.</p>

        <br>

        <h2><strong>7.</strong> Pasirinkite tinkamą degalų politiką</h2>
        <p>Geriausias pasirinkimas – „pilnas–pilnas". Pasiimate automobilį su pilnu baku ir grąžinate pilną, todėl mokate tik už realiai sunaudotus degalus.</p>

        <br>

        <h2><strong>8.</strong> Patikrinkite kilometražo limitą</h2>
        <p>Jei planuojate ilgas keliones, rinkitės pasiūlymus su neribotu kilometražu – taip išvengsite papildomų mokesčių.</p>

        <br>

        <h2><strong>9.</strong> Priedus turėkite savo</h2>
        <p>GPS navigacija ar vaikiška kėdutė iš nuomos įmonės gali kainuoti brangiai. Dažnai pigiau atsivežti savus priedus arba naudotis telefono navigacija.</p>

        <br>

        <h2><strong>10.</strong> Perskaitykite sutartį iki galo</h2>
        <p>Smulkios sąlygos gali slėpti papildomus mokesčius už automobilio švarą, vėlavimą ar grąžinimą už darbo valandų ribų. Visada perskaitykite sutartį prieš pasirašydami.</p>

        <br>

        <h3><strong>Išvada</strong></h3>
        <p>Automobilio nuoma Lietuvoje nebūtinai turi būti brangi. Planuokite iš anksto, rinkitės ekonomiškus variantus ir pasitikrinkite visas sąlygas. Taip sutaupysite pinigų ir galėsite ramiai mėgautis kelione.</p>
        
        <p>Carbonus siūlo skaidrias automobilių nuomos kainas be paslėptų mokesčių, todėl galite būti tikri, kad mokėsite tik už tai, kas sutarta. Mūsų automobiliai tinkami bet kokiai kelionei - nuo verslo susitikimų iki šeimos atostogų po Lietuvą.</p>
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
      image: blogLithuaniaTravel,
      slug: "kelioniu-po-lietuva-gidas-geriausi-marsrutai",
      content: `
        <p>Automobilio nuoma Lietuvoje suteikia visišką laisvę keliauti – galite atrasti tiek populiarius turistinius objektus, tiek paslėptus kampelius, kurių nepasieksite viešuoju transportu. Šis gidas padės suplanuoti įsimintinas keliones po Lietuvą su nuomotu automobiliu.</p>

        <br>

        <h2><strong>1.</strong> Neringa ir Kuršių nerija</h2>
        <p><strong>Maršrutas:</strong> Klaipėda – Smiltynė – Juodkrantė – Nida</p>
        <p>Pasiplaukite keltu iš Klaipėdos į Smiltynę.</p>
        <p>Sustokite Juodkrantėje ir aplankykite Raganų kalną.</p>
        <p>Toliau važiuokite iki Nidos, kur laukia kopos, Parnidžio saulės laikrodis ir žvejų tradicijos.</p>
        <p><strong>Patariama:</strong> užsisakykite automobilį iš anksto vasaros sezonu – paklausa didelė.</p>

        <br>

        <h2><strong>2.</strong> Žemaitijos nacionalinis parkas</h2>
        <p><strong>Maršrutas:</strong> Telšiai – Plateliai – Šatrijos kalnas</p>
        <p>Pasivaikščiokite aplink Platelių ežerą.</p>
        <p>Užlipkite ant Šatrijos kalno – legenda sako, kad čia rinkdavosi raganos.</p>
        <p>Aplankykite Žemaičių muziejų „Alka" Telšiuose.</p>
        <p><strong>Patariama:</strong> rinkitės kompaktišką automobilį – keliai siauri ir vingiuoti.</p>

        <br>

        <h2><strong>3.</strong> Aukštaitijos ežerų kelias</h2>
        <p><strong>Maršrutas:</strong> Vilnius – Palūšė – Ladakalnis – Ginučiai</p>
        <p>Kelionę pradėkite nuo Palūšės bažnyčios.</p>
        <p>Užlipkite į Ladakalnį, iš kur atsiveria šešių ežerų panorama.</p>
        <p>Sustokite Ginučiuose, kur yra malūnas ir autentiškas kaimas.</p>
        <p><strong>Patariama:</strong> pasirinkite automobilį su neribotu kilometražu – maršrutas ilgas.</p>

        <br>

        <h2><strong>4.</strong> Dzūkijos gamtos perlai</h2>
        <p><strong>Maršrutas:</strong> Druskininkai – Merkinė – Čepkeliai</p>
        <p>Pradėkite nuo Druskininkų SPA ir Lynų kelio.</p>
        <p>Merkinės apžvalgos bokštas leis pamatyti Nemuno vingius.</p>
        <p>Čepkelių raisto takai patiks gamtos mylėtojams.</p>
        <p><strong>Patariama:</strong> pasirinkite automobilį su oro kondicionieriumi – vasarą čia labai karšta.</p>

        <br>

        <h2><strong>5.</strong> Istorinė kelionė po Aukštaitiją</h2>
        <p><strong>Maršrutas:</strong> Kaunas – Kernavė – Trakai – Vilnius</p>
        <p>Kaune aplankykite Senamiestį ir Pažaislio vienuolyną.</p>
        <p>Kernavėje susipažinkite su pirmąją Lietuvos sostine.</p>
        <p>Trakuose nepamirškite užsukti į pilį ir paragauti kibinų.</p>
        <p>Kelionę užbaikite Vilniaus Senamiestyje.</p>
        <p><strong>Patariama:</strong> nuomos punktą rinkitės didesniame mieste – pasirinkimas platesnis ir kaina mažesnė.</p>

        <br>

        <h3><strong>Išvada</strong></h3>
        <p>Keliauti po Lietuvą nuomotu automobiliu – patogus ir įdomus būdas pažinti šalį. Nuo pajūrio kopų iki ežerų bei miškų – kiekvienas maršrutas turi savo žavesį. Suplanuokite kelionę iš anksto, pasirinkite tinkamą automobilį ir mėgaukitės Lietuvos grožiu be rūpesčių.</p>
        
        <p>Carbonus automobiliai puikiai tinka kelionėms po Lietuvą – mūsų flotą sudaro patikimi ir ekonomiški automobiliai, kurie padės pasiekti bet kurį šalies kampelį. Su 24/7 palaikymu galite keliauti ramiai, žinodami, kad esate gerose rankose.</p>
      `
    },
    "automobiliu-nuomos-draudimas-kas-reikia-zinoti": {
      id: "3",
      title: "Automobilių nuomos draudimas: ką reikia žinoti?",
      excerpt: "Sužinokite, kokie yra automobilių nuomos draudimo tipai, kokių papildomų apsaugų jums gali prireikti ir kaip išvengti paslėptų mokesčių nuomojant automobilį Lietuvoje ar užsienyje.",
      author: "Carbonus komanda", 
      publishDate: "2024-12-05",
      readTime: "6 min",
      category: "Draudimas",
      image: blogCarInsurance,
      slug: "automobiliu-nuomos-draudimas-kas-reikia-zinoti",
      content: `
        <p>Nuomojant automobilį, vienas svarbiausių klausimų – draudimas. Dažnai jis sudaro nemažą dalį bendros nuomos kainos, todėl svarbu žinoti, kokios draudimo rūšys egzistuoja, kas jau įskaičiuota į kainą ir kada verta rinktis papildomas paslaugas.</p>

        <br>

        <h2><strong>Pagrindinės automobilių nuomos draudimo rūšys</strong></h2>

        <br>

        <h3><strong>1.</strong> Civilinės atsakomybės draudimas (TPL, Third Party Liability)</h3>
        <p>Tai privalomas draudimas, kuris apmoka žalą kitiems asmenims ar jų turtui, jei sukelsite avariją. Lietuvoje šis draudimas įskaičiuotas pagal įstatymą.</p>

        <br>

        <h3><strong>2.</strong> Kasko arba žalos atlyginimo draudimas (CDW, Collision Damage Waiver)</h3>
        <p>Padengia žalą jūsų nuomojamam automobiliui avarijos atveju. Dažnai turi frančizę (savąją riziką), kurią teks sumokėti patiems.</p>

        <br>

        <h3><strong>3.</strong> Vagystės draudimas (TP, Theft Protection)</h3>
        <p>Apsaugo nuo finansinės atsakomybės, jei automobilis bus pavogtas. Taip pat paprastai taikoma frančizė.</p>

        <br>

        <h2><strong>Papildomi draudimai, kuriuos siūlo nuomos įmonės</strong></h2>

        <br>

        <h3><strong>Super CDW arba „Zero Excess"</strong></h3>
        <p>Sumažina arba visai panaikina jūsų atsakomybę už žalą (be frančizės).</p>

        <h3><strong>Asmeninis nelaimingų atsitikimų draudimas (PAI)</strong></h3>
        <p>Apima keleivių ir vairuotojo sveikatos išlaidas.</p>

        <h3><strong>Padangų, stiklų ir veidrodėlių draudimas</strong></h3>
        <p>Nes šios dalys dažnai neįtrauktos į standartinį CDW.</p>

        <br>

        <h2><strong>Į ką atkreipti dėmesį renkantis draudimą?</strong></h2>

        <br>

        <h3><strong>Frančizė (sava rizika)</strong></h3>
        <p>Pasitikrinkite, kokia suma teks padengti iš savo kišenės. Ji gali siekti nuo kelių šimtų iki kelių tūkstančių eurų.</p>

        <h3><strong>Kas jau įskaičiuota į nuomos kainą</strong></h3>
        <p>Dažnai bazinis draudimas yra įtrauktas, bet tik su didele frančize.</p>

        <h3><strong>Kreditinės kortelės draudimas</strong></h3>
        <p>Kai kurios banko kortelės jau apima nuomos automobilio draudimą. Tai gali padėti sutaupyti.</p>

        <h3><strong>Smulkių raidžių skaitymas</strong></h3>
        <p>Patikrinkite, ar draudimas apima stiklų, padangų, dugno ir stogo žalą.</p>

        <h3><strong>Nuomos vieta</strong></h3>
        <p>Oro uostuose draudimai gali kainuoti brangiau.</p>

        <br>

        <h2><strong>Patarimai, kaip sutaupyti</strong></h2>

        <br>

        <p>Palyginkite draudimo kainas iš anksto, ne tik atvykę į nuomos punktą.</p>
        <p>Įvertinkite riziką – jei keliaujate tik mieste, gal pakaks bazinio draudimo, bet kalnuose ar ilguose maršrutuose verta rinktis pilnesnę apsaugą.</p>
        <p>Fotografuokite automobilį prieš ir po nuomos – taip išvengsite ginčų dėl žalos.</p>

        <br>

        <h3><strong>Išvada</strong></h3>
        <p>Automobilių nuomos draudimas gali atrodyti painus, tačiau žinant pagrindinius terminus ir sąlygas, galima išvengti permokų ir keliauti ramiai. Visada pasidomėkite, kas įskaičiuota į kainą, kokia frančizė taikoma ir ar verta rinktis papildomą apsaugą.</p>
        
        <p>Carbonus siūlo skaidrias draudimo sąlygas be paslėptų mokesčių. Mūsų komanda visada paaiškina visas draudimo galimybes ir padės pasirinkti tinkamą apsaugą jūsų kelionei. Su mumis galite keliauti ramiai, žinodami, kad esate tinkamai apsaugoti.</p>
      `
    },
    "verslo-keliones-kaip-issirinkti-tinkama-automobili": {
      id: "4",
      title: "Verslo kelionės: kaip išsirinkti tinkamą automobilį?",
      excerpt: "Sužinokite, į ką atkreipti dėmesį renkantis automobilį verslo kelionėms Lietuvoje ar užsienyje. Komfortas, patikimumas ir reprezentatyvumas – svarbiausi kriterijai.",
      author: "Carbonus komanda",
      publishDate: "2024-11-30",
      readTime: "4 min",
      category: "Verslas",
      image: blogBusinessTravel,
      slug: "verslo-keliones-kaip-issirinkti-tinkama-automobili",
      content: `
        <p>Verslo kelionės reikalauja ne tik tikslaus planavimo, bet ir tinkamo transporto pasirinkimo. Automobilis tokiose kelionėse tampa ne tik susisiekimo priemone, bet ir įvaizdžio dalimi. Tinkamai pasirinktas automobilis padės sutaupyti laiko, keliauti patogiai ir sudaryti gerą įspūdį partneriams.</p>

        <br>

        <h2><strong>1.</strong> Patogumas ir komfortas</h2>
        <p>Ilgos kelionės, susitikimai keliuose miestuose ar net šalyse reiškia daug valandų už vairo. Patogios sėdynės, erdvus salonas ir tylus variklis užtikrins produktyvesnę kelionę ir mažiau nuovargio.</p>

        <br>

        <h2><strong>2.</strong> Automobilio klasė ir įvaizdis</h2>
        <p>Verslo aplinkoje svarbus ne tik funkcionalumas, bet ir reprezentatyvumas.</p>
        <p><strong>Ekonominė klasė</strong> – tinkama trumpoms kelionėms mieste.</p>
        <p><strong>Vidutinė klasė</strong> – patogesnė ilgesniems maršrutams.</p>
        <p><strong>Premium klasė</strong> – idealiai tinka susitikimams su klientais ar partneriais, kai svarbus pirmas įspūdis.</p>

        <br>

        <h2><strong>3.</strong> Degalų sąnaudos ir ekologija</h2>
        <p>Šiuolaikiniai verslo keliautojai vis dažniau atsižvelgia į išlaidas ir tvarumą. Rinkitės ekonomiškus hibridinius ar dyzelinius automobilius, o miestuose – net ir elektromobilius, jei nuomos punktas siūlo tokią galimybę.</p>

        <br>

        <h2><strong>4.</strong> Technologijos ir įranga</h2>
        <p>Verslo kelionėse itin praverčia:</p>
        <p>GPS navigacija arba integruota multimedijos sistema.</p>
        <p>Bluetooth ryšys laisvoms rankoms.</p>
        <p>USB ar bevieliai įkrovikliai įrenginiams.</p>
        <p>Kruizo kontrolė ilgiems atstumams.</p>

        <br>

        <h2><strong>5.</strong> Draudimas ir pagalba kelyje</h2>
        <p>Net ir atsakingai vairuojant, nenumatytų situacijų išvengti nepavyksta. Verslo kelionėse verta rinktis pilnesnį draudimą ir paslaugas, kurios užtikrina pagalbą kelyje visą parą. Taip būsite tikri, kad susitikimų grafikas nesugrius dėl techninių problemų.</p>

        <br>

        <h2><strong>6.</strong> Automobilio dydis ir lagaminų vieta</h2>
        <p>Jeigu keliaujate vienas, pakaks kompaktiško automobilio. Tačiau komandinei kelionei verta rinktis erdvesnį modelį arba net miniveną, kad visiems būtų patogu, o bagažui užtektų vietos.</p>

        <br>

        <h3><strong>Išvada</strong></h3>
        <p>Renkantis automobilį verslo kelionėms, svarbiausia suderinti komfortą, įvaizdį ir ekonomiškumą. Įvertinkite kelionės tikslą, dalyvių skaičių ir maršrutą – tuomet nuomojamas automobilis taps patikimu pagalbininku, o ne papildomu rūpesčiu.</p>
        
        <p>Carbonus siūlo platų verslo automobilių parką – nuo ekonomiškų sedanų iki premium klasės modelių. Mūsų komanda padės išsirinkti idealų automobilį jūsų verslo poreikiams ir užtikrins sklandžią kelionę be rūpesčių.</p>
      `
    },
    "ziemos-vairavimas-saugumas-kelyje": {
      id: "5",
      title: "Žiemos vairavimas: saugumas kelyje su nuomotu automobiliu",
      excerpt: "Svarbiausios žiemos vairavimo taisyklės ir patarimai saugumui.",
      author: "Carbonus komanda",
      publishDate: "2024-11-25",
      readTime: "7 min",
      category: "Saugumas",
      image: blogWinterDriving,
      slug: "ziemos-vairavimas-saugumas-kelyje",
      content: `
        <h2>Žiemos vairavimo iššūkiai</h2>
        <p>Žiemos sąlygos reikalauja ypatingos atsargos kelyje. Su nuomotu automobiliu ypač svarbu žinoti, kaip elgtis ekstremalaus oro sąlygomis.</p>
        
        <h3>Pasiruošimas žiemos kelionėms</h3>
        <h4>Prieš išvažiuojant:</h4>
        <ul>
          <li>Patikrinkite padangų būklę</li>
          <li>Įsitikinkite, kad turite gerai veikiantį šildymą</li>
          <li>Pasiimkite šiltus drabužius ir antklodę</li>
          <li>Užsipilkite pilną kuro baką</li>
        </ul>
        
        <h3>Saugaus vairavimo taisyklės žiemą</h3>
        <ol>
          <li><strong>Mažinkite greitį</strong> - slidžiuose keliuose važiuokite lėčiau</li>
          <li><strong>Didinkite atstumus</strong> - stabdymo kelias žiemą ilgesnis</li>
          <li><strong>Lygūs judesiai</strong> - vengkite staigių manevrų</li>
          <li><strong>Stebėkite orų prognozes</strong> - planuokite keliones pagal orą</li>
        </ol>
        
        <h3>Ką daryti nepavykus situacijoms?</h3>
        <p>Jei automobilis pradėjo slysti arba užstrigo sniego:</p>
        <ul>
          <li>Išlikite ramūs</li>
          <li>Nespauškite staigiai stabdžių</li>
          <li>Pasukite ratą slydimo kryptimi</li>
          <li>Jei užstrigote - barstykit smėlį po ratais</li>
        </ul>
        
        <h3>Carbonus žiemos pagalba</h3>
        <p>Visi mūsų automobiliai aprūpinti:</p>
        <ul>
          <li>Žiemos padangomis</li>
          <li>Ledų grandykle</li>
          <li>24/7 pagalba kelyje</li>
          <li>Pilna draudimo apsauga</li>
        </ul>
        
        <p>Keliauki saugiai su Carbonus - net ir žiemiausią žiemą!</p>
      `
    },
    "seimos-kelione-kaip-pasirinkti-idealu-automobili": {
      id: "6",
      title: "Šeimos kelionė: kaip pasirinkti idealų automobilį vaikams",
      excerpt: "Geriausių šeimos automobilių apžvalga nuomai. Saugumas, erdvumas ir patogumas.",
      author: "Carbonus komanda",
      publishDate: "2024-11-20",
      readTime: "5 min",
      category: "Šeima",
      image: blogFamilyTravel,
      slug: "seimos-kelione-kaip-pasirinkti-idealu-automobili",
      content: `
        <h2>Šeimos kelionės ypatumai</h2>
        <p>Keliaujant su vaikais automobilis tampa jūsų antruoju namų. Svarbu pasirinkti automobilį, kuris užtikrins saugumą, komfortą ir pakankamai vietos visiems šeimos nariams.</p>
        
        <h3>Pagrindiniai kriterijai šeimos automobiliui</h3>
        <h4>Saugumas</h4>
        <ul>
          <li>Aukštas Euro NCAP saugumo reitingas</li>
          <li>Isofix tvirtinimai vaikų kėdutėms</li>
          <li>Airbag sistema visoms sėdynėms</li>
          <li>Elektroninės saugumo sistemos</li>
        </ul>
        
        <h4>Erdvumas</h4>
        <ul>
          <li>Pakankamai vietos kojoms</li>
          <li>Didelis bagažinės skyrius</li>
          <li>Papildomi daiktų skyreliai</li>
          <li>Lengvas įlipimas ir išlipimas</li>
        </ul>
        
        <h3>Geriausi šeimos automobilių tipai</h3>
        <h4>Minivenai</h4>
        <p>Idealus pasirinkimas didelėms šeimoms:</p>
        <ul>
          <li>7 keleivių vietos</li>
          <li>Didžiulis bagažas</li>
          <li>Aukšta sėdėjimo pozicija</li>
          <li>Slankiojančios durys</li>
        </ul>
        
        <h4>SUV automobiliai</h4>
        <p>Universalus sprendimas šeimai:</p>
        <ul>
          <li>Geras kelio peržvalgumas</li>
          <li>Saugi konstrukcija</li>
          <li>Erdvus salonas</li>
          <li>Tinka įvairiems keliams</li>
        </ul>
        
        <h3>Patarimai kelionei su vaikais</h3>
        <ol>
          <li><strong>Vaikų kėdutės</strong> - rezervuokite iš anksto</li>
          <li><strong>Pramogos</strong> - pasiimkite planšetę su filmukais</li>
          <li><strong>Užkandžiai</strong> - turėkite sveikų užkandžių</li>
          <li><strong>Dažnos pertraukos</strong> - stabtelėkite kas 2 valandas</li>
        </ol>
        
        <h3>Carbonus šeimos pasiūlymai</h3>
        <p>Specialiai šeimoms siūlome:</p>
        <ul>
          <li>Nemokamas vaikų kėdutes</li>
          <li>Šeimos nuolaidas</li>
          <li>Automobilio higienos paslaugas</li>
          <li>Lankstų grąžinimo grafiką</li>
        </ul>
        
        <p>Kartu keliaujame saugiai ir smagu!</p>
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
            Grįžti į naujienas
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
              Grįžti į naujienas
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