"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertTriangle,
  LogOut,
  Trash2,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";

export default function DangerZone() {
  const { signOut, deleteAccount } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoutAll = async () => {
    setIsLoading(true);
    try {
      // Implementation would depend on your auth provider
      await signOut({ all: true });
      toast.success("You have been logged out from all devices");
      setIsLogoutModalOpen(false);
    } catch (error) {
      toast.error("Failed to log out from all devices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex flex-col gap-3 md:min-w-64">
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account security and danger zone settings
        </p>
      </div>

      <Card className="w-full shadow-sm border-destructive/10">
        <CardHeader className="pb-4 space-y-1 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            These actions are potentially destructive and cannot be undone
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Log out from all devices */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Log out from all devices</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will end all active sessions across all your devices
                </p>
              </div>
              <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Log out all</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Out From All Devices</DialogTitle>
                    <DialogDescription>
                      This will immediately end all of your active sessions. You will need to log in again on all devices.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogoutAll}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Log Out All Devices"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Delete account */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-destructive">Delete account</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Delete Your Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-medium text-destructive">Warning: This is irreversible</h4>
                          <ul className="text-sm text-destructive/80 space-y-1 list-disc pl-4">
                            <li>All your links, bio pages, and analytics will be deleted</li>
                            <li>Your custom domains will be unlinked</li>
                            <li>You will lose access to your organizations</li>
                            <li>Your username will become available for others</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirmation">
                        Type <span className="font-medium">DELETE</span> to confirm
                      </Label>
                      <Input 
                        id="delete-confirmation" 
                        placeholder="DELETE"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="border-destructive/50 focus-visible:ring-destructive"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isLoading || deleteConfirmation !== "DELETE"}
                    >
                      {isLoading ? "Processing..." : "Permanently Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}