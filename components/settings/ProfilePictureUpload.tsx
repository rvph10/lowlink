"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Trash, Move } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Database } from "@/utils/supabase/types/database.types";
interface ProfilePictureUploadProps {
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  isLoading: boolean;
  previewImage: string | null;
  setPreviewImage: (value: string | null) => void;
}

interface CropState {
  x: number;
  y: number;
  scale: number;
}

export default function ProfilePictureUpload({
  profile,
  isLoading,
  previewImage,
  setPreviewImage,
}: ProfilePictureUploadProps) {
  const { uploadProfilePicture, removeProfilePicture, isUpdating } = useProfile();
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });

  const imageRef = useRef<HTMLImageElement>(null);

  const svgUrl = profile?.profile_picture_url
    ? null
    : `data:image/svg+xml;base64,${btoa(profile?.profile_picture_svg || "")}`;

  const handleProfilePictureUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        // Open the crop modal when an image is selected
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setCropModalOpen(true);

          // Reset crop settings for new uploads
          setCrop({ x: 0, y: 0, scale: 1 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    // Empty function to satisfy the event handler
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        // Open the crop modal when an image is dropped
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setCropModalOpen(true);

          // Reset crop settings for new uploads
          setCrop({ x: 0, y: 0, scale: 1 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = async () => {
    const { error } = await removeProfilePicture();
    if (!error) {
      setPreviewImage(null);
      toast.success("Profile picture removed");
    } else {
      toast.error("Failed to remove profile picture");
    }
  };

  const handleCropComplete = async () => {
    if (!selectedFile) {
      toast.error("No image selected");
      return;
    }

    try {
      // Upload new image with crop settings
      const { url, error } = await uploadProfilePicture(selectedFile, crop);

      if (error) {
        throw error;
      } else {
        // Close the modal if successful
        setCropModalOpen(false);
        // Set preview image if needed
        if (url) {
          setPreviewImage(url);
          toast.success("Profile picture updated");
        }
      }
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to update profile picture: ${error.message}`);
    }
  };

  const handleCropChange = (type: keyof CropState, value: number) => {
    setCrop((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 w-full">
        {isLoading ? (
          <div className="relative">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full absolute bottom-0 right-0" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative group"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-md relative">
                <Image
                  src={
                    previewImage ||
                    profile?.profile_picture_url ||
                    svgUrl ||
                    ""
                  }
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  ref={imageRef}
                  unoptimized // Use this to avoid the Next.js image optimization issues
                />
                {/* Hover overlay to indicate clickable for upload */}
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="text-white text-center">
                    <Camera size={24} className="mx-auto mb-1" />
                    <span className="text-xs font-medium">
                      Change Photo
                    </span>
                  </div>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>
            </div>

            {profile?.profile_picture_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveProfilePicture}
                className="text-destructive hover:text-destructive flex items-center gap-1"
                disabled={isUpdating}
              >
                <Trash size={14} />
                <span>Remove</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image Cropping Dialog */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Profile Picture</DialogTitle>
            <DialogDescription>
              Drag to reposition or use the slider to resize your profile
              picture.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="h-64 w-64 rounded-full overflow-hidden border-4 border-background shadow-md relative">
              {selectedImage && (
                <div
                  className="cursor-move w-full h-full flex items-center justify-center"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={selectedImage}
                    alt="Profile picture preview"
                    width={256}
                    height={256}
                    className="object-cover"
                    style={{
                      transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.scale})`,
                      transition: "transform 0.1s",
                      transformOrigin: "center",
                      width: "100%",
                      height: "100%",
                    }}
                    draggable={false}
                    unoptimized // Needed for data URLs
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-move"
                    onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCropX = crop.x;
                      const startCropY = crop.y;

                      const onMouseMove = (e: MouseEvent) => {
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        setCrop((prev) => ({
                          ...prev,
                          x: startCropX + deltaX,
                          y: startCropY + deltaY,
                        }));
                      };

                      const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                      };

                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    }}
                  >
                    <Move size={24} className="text-white opacity-50" />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Zoom</span>
                <span className="text-sm">{Math.round(crop.scale * 100)}%</span>
              </div>
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={[crop.scale]}
                onValueChange={(value) => handleCropChange("scale", value[0])}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCropModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete} disabled={isUpdating}>
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Apply"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}