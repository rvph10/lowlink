import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, RefreshCw } from "lucide-react";
import { IconQrcode } from "@tabler/icons-react";
import Image from "next/image";
import { type Link } from "@/types/types";

/**
 * QR Code tab content component
 */
const QRCodeTab = ({
  link,
  onGenerateQr,
}: {
  link: Link;
  onGenerateQr: () => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
        <CardDescription>
          {link.qrCode
            ? "Use this QR code in your marketing materials"
            : "Generate a QR code for your link"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        {link.qrCode ? (
          <div className="space-y-8">
            <div className="relative">
              <Image
                src={link.qrCode}
                alt="QR Code"
                width={250}
                height={250}
                className="border rounded-md"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This QR code redirects to:
              </p>
              <p className="font-medium">https://{link.shortUrl}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download SVG
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="border border-dashed border-muted-foreground/50 rounded-md h-[250px] w-[250px] flex items-center justify-center">
              <IconQrcode className="h-24 w-24 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No QR code has been generated for this link yet.
              </p>
              <Button onClick={onGenerateQr}>Generate QR Code</Button>
            </div>
          </div>
        )}
      </CardContent>
      {link.qrCode && (
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="space-y-2 w-full">
            <p className="text-sm font-medium">Customization Options</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foreground">Foreground Color</Label>
                <div className="flex">
                  <Input
                    id="foreground"
                    type="color"
                    defaultValue="#000000"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Background Color</Label>
                <div className="flex">
                  <Input
                    id="background"
                    type="color"
                    defaultValue="#FFFFFF"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate QR Code
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default QRCodeTab;
