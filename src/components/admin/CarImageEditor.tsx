import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

export const CarImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setEditedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeBadges = async () => {
    if (!originalImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-car-image', {
        body: {
          imageData: originalImage,
          instruction: "Remove the 'Ceed' text badge on the left side and the 'e39' text badge on the right side of this car's rear. Keep everything else intact including the KIA logo, taillights, and body styling. Make sure the edited area blends naturally with the surrounding bodywork."
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to edit image: ' + error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.editedImage) {
        setEditedImage(data.editedImage);
        toast.success("Badges removed successfully!");
      } else {
        toast.error("No edited image returned");
      }
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error('Failed to edit image');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = editedImage;
    link.download = 'kia-ceed-rear-edited.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Image Badge Remover</CardTitle>
        <CardDescription>
          Upload a car image and remove text badges using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {originalImage && (
            <div className="space-y-2">
              <h3 className="font-semibold">Original Image</h3>
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}

          {editedImage && (
            <div className="space-y-2">
              <h3 className="font-semibold">Edited Image</h3>
              <img
                src={editedImage}
                alt="Edited"
                className="w-full h-auto rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={removeBadges}
            disabled={!originalImage || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing Badges...
              </>
            ) : (
              'Remove Badges'
            )}
          </Button>

          {editedImage && (
            <Button onClick={downloadImage} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
