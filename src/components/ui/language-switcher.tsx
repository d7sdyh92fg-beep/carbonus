import { useLanguage } from "@/hooks/use-language";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { getEquivalentPath } from "@/utils/routes";

const languages = [
  { code: 'lt', name: 'LT', flag: '🇱🇹' },
  { code: 'en', name: 'EN', flag: '🇬🇧' },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: 'lt' | 'en') => {
    setLanguage(newLanguage);
    
    // Navigate to the equivalent path in the new language
    const newPath = getEquivalentPath(location.pathname, newLanguage);
    if (newPath !== location.pathname) {
      navigate(newPath);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-white hover:text-white hover:bg-white/10"
        >
          <span className="text-sm">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium">{currentLanguage?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[rgba(24,34,31,0.92)] backdrop-blur-[14px] border-white/10 text-white">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as any)}
            className="flex items-center gap-2 cursor-pointer text-white focus:bg-white/10 focus:text-white"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}