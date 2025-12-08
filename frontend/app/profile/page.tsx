"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  Coins,
  Clock,
  Edit2,
  Save,
  X,
  Building2,
  Globe,
  Phone,
  Target,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  ImagePlus,
  Lock,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch complete user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authLoading && !authUser) {
        router.push("/login");
        return;
      }

      if (authUser) {
        try {
          const token = localStorage.getItem("auth-token");
          
          // Check if token exists before making API call
          if (!token) {
            console.error("No auth token found in localStorage");
            toast({
              title: "Authentication Error",
              description: "Please log in again",
              variant: "destructive",
            });
            router.push("/login");
            return;
          }

          console.log("Fetching user data with token:", token.substring(0, 20) + "...");
          console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
          
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            }
          );

          console.log("API Response:", response.data);
          
          const userData = (response.data as any).data.user;
          
          if (!userData) {
            console.error("User data is missing from response");
            throw new Error("User data not found in response");
          }
          
          console.log("User data fetched successfully:", userData.email);
          setUser(userData);
          
          // Initialize form data with complete user data
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            age: userData.age || "",
            city: userData.city || "",
            profession: userData.profession || "",
            contactNumber: userData.contactNumber || "",
            nearestRailwayStation: userData.nearestRailwayStation || "",
            // NGO fields
            organizationType: userData.organizationType || "",
            websiteUrl: userData.websiteUrl || "",
            ngoDescription: userData.ngoDescription || "",
            // Corporate fields
            companyType: userData.companyType || "",
            industrySector: userData.industrySector || "",
            companyDescription: userData.companyDescription || "",
            // Address fields (for NGO and Corporate)
            addressStreet: userData.address?.street || "",
            addressCity: userData.address?.city || "",
            addressState: userData.address?.state || "",
            addressZip: userData.address?.zip || "",
            addressCountry: userData.address?.country || "India",
          });
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
          console.error("Error headers:", error.response?.headers);
          
          let errorMessage = "Failed to load user data";
          
          if (error.response?.status === 401) {
            errorMessage = "Session expired. Please log in again";
            // Clear invalid token and redirect to login
            localStorage.removeItem("auth-token");
            localStorage.removeItem("auth-user");
            setTimeout(() => router.push("/login"), 2000);
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserData();
  }, [authUser, authLoading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeProfilePictureFromServer = async () => {
    setIsRemovingImage(true);
    try {
      const token = localStorage.getItem("auth-token");
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUserData = (response.data as any).data.user;
      setUser(updatedUserData);
      
      // Update auth context user in localStorage
      const authUser = JSON.parse(localStorage.getItem("auth-user") || "{}");
      const updatedAuthUser = { ...authUser, profilePicture: null };
      localStorage.setItem("auth-user", JSON.stringify(updatedAuthUser));

      setShowProfilePictureDialog(false);

      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      });
      
      // Refresh the page to update all instances
      window.location.reload();
    } catch (error: any) {
      console.error("Error removing profile picture:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setIsRemovingImage(false);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("auth-token");
      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUserData = (response.data as any).data.user;
      setUser(updatedUserData);
      
      // Update auth context user in localStorage
      const authUser = JSON.parse(localStorage.getItem("auth-user") || "{}");
      const updatedAuthUser = { ...authUser, profilePicture: updatedUserData.profilePicture };
      localStorage.setItem("auth-user", JSON.stringify(updatedAuthUser));

      // Clear the file input and preview
      setProfilePicture(null);
      setProfilePicturePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
      
      // Refresh the page to update all instances
      window.location.reload();
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("auth-token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Password changed successfully!",
      });

      // Reset form and close dialog
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordDialog(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const token = localStorage.getItem("auth-token");
      await axios({
        method: 'delete',
        url: `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/account`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          password: deletePassword,
        },
      });

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });

      // Clear local storage and redirect to login
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
      router.push("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      
      // Prepare the data to send - format address fields for NGO and Corporate
      const dataToSend = { ...formData };
      
      if (user.role === 'ngo' || user.role === 'corporate') {
        // Convert flat address fields to nested address object
        dataToSend.address = {
          street: formData.addressStreet,
          city: formData.addressCity,
          state: formData.addressState,
          zip: formData.addressZip,
          country: formData.addressCountry,
        };
        
        // Remove the flat address fields from the data
        delete dataToSend.addressStreet;
        delete dataToSend.addressCity;
        delete dataToSend.addressState;
        delete dataToSend.addressZip;
        delete dataToSend.addressCountry;
      }
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/profile`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local user state with the response
      const updatedUserData = (response.data as any).data.user;
      setUser(updatedUserData);
      
      // Also update auth context user in localStorage
      const authUser = JSON.parse(localStorage.getItem("auth-user") || "{}");
      const updatedAuthUser = { ...authUser, ...updatedUserData };
      localStorage.setItem("auth-user", JSON.stringify(updatedAuthUser));
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6]">
        <div className="text-center">
          <img
            src="/mascots/video_mascots/mascot_walking_video.gif"
            alt="Loading..."
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
          <p className="text-gray-700 text-lg font-semibold">Loading profile...</p>
          <p className="text-gray-600 text-sm mt-2">Please wait while we fetch your details!</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5A5] via-white to-[#7DD9A6] py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #7DD9A6, #6BC794);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6BC794, #5AB583);
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4 hover:bg-white/50 group text-gray-700 font-medium backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>

        {/* Header Section with Profile Picture */}
        <Card className="overflow-hidden mb-6 shadow-xl border-2 border-[#D4E7B8]">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-[#7DD9A6] via-[#6BC794] to-[#5AB583] relative">
            <div className="absolute inset-0 bg-black opacity-5"></div>
          </div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-2xl ring-4 ring-[#D4E7B8]">
                  <AvatarImage 
                    src={profilePicturePreview || user.profilePicture} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-[#7DD9A6] to-[#6BC794] text-white">
                    <User className="w-16 h-16 sm:w-20 sm:h-20" />
                  </AvatarFallback>
                </Avatar>
                
                {/* Camera Icon Overlay - Opens dialog */}
                <button
                  onClick={() => setShowProfilePictureDialog(true)}
                  className="absolute bottom-0 right-0 bg-[#7DD9A6] hover:bg-[#6BC794] text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
                  title="Manage profile picture"
                >
                  <Camera className="w-5 h-5" />
                </button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left sm:mt-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                  {user.name}
                </h1>
                <p className="text-gray-700 flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] text-white shadow-md">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {/* Display city for volunteers or city from address for NGO/Corporate */}
                  {((user.role === 'user' && user.city) || 
                    ((user.role === 'ngo' || user.role === 'corporate') && user.address?.city)) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E8F5A5] text-gray-800 border border-[#D4E7B8]">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.role === 'user' ? user.city : user.address?.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="sm:mt-8">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-[#7DD9A6] hover:bg-[#6BC794] text-white shadow-lg"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          age: user.age || "",
                          city: user.city || "",
                          profession: user.profession || "",
                          organizationType: user.organizationType || "",
                          websiteUrl: user.websiteUrl || "",
                          contactNumber: user.contactNumber || "",
                          ngoDescription: user.ngoDescription || "",
                          companyType: user.companyType || "",
                          industrySector: user.industrySector || "",
                          companyDescription: user.companyDescription || "",
                          addressStreet: user.address?.street || "",
                          addressCity: user.address?.city || "",
                          addressState: user.address?.state || "",
                          addressZip: user.address?.zip || "",
                          addressCountry: user.address?.country || "India",
                        });
                      }}
                      variant="outline"
                      className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
                      size="lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Picture Upload Actions */}
            {profilePicture && (
              <div className="mt-6 p-4 bg-[#E8F5A5] border-2 border-[#D4E7B8] rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-[#6BC794]" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        New profile picture selected
                      </p>
                      <p className="text-xs text-gray-700">{profilePicture.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={uploadProfilePicture}
                      disabled={isUploadingImage}
                      className="bg-[#7DD9A6] hover:bg-[#6BC794] text-white"
                      size="sm"
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRemoveProfilePicture}
                      disabled={isUploadingImage}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Cards - For Volunteers */}
        {user.role === "user" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-2 border-[#D4E7B8] shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-[#E8F5A5] to-[#D4E7B8]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-gray-800">{user.points || 0}</p>
                  </div>
                  <Award className="w-12 h-12 text-[#7DD9A6] opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#D4E7B8] shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-[#FFE8A5] to-[#FFD88A]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Coins</p>
                    <p className="text-3xl font-bold text-gray-800">{user.coins || 0}</p>
                  </div>
                  <Coins className="w-12 h-12 text-yellow-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#D4E7B8] shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-[#B8E8D4] to-[#9DD9C3]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Hours Volunteered</p>
                    <p className="text-3xl font-bold text-gray-800">{user.volunteeredHours || 0}</p>
                  </div>
                  <Clock className="w-12 h-12 text-[#6BC794] opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Information */}
        <Card className="border-2 border-[#D4E7B8] shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#E8F5A5] to-[#D4E7B8] border-b-2 border-[#D4E7B8]">
            <CardTitle className="text-2xl text-gray-800">Profile Information</CardTitle>
            <CardDescription className="text-gray-700">Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Common Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#7DD9A6]" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-800">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                        <User className="w-4 h-4 text-gray-500" />
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-800">Email Address</Label>
                    <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {user.email}
                      <CheckCircle className="w-4 h-4 text-[#7DD9A6] ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer-specific fields */}
              {user.role === "user" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#7DD9A6]" />
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium text-gray-800">Age</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Enter your age"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {user.age || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-800">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Enter your city"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {user.city || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="profession" className="text-sm font-medium text-gray-800">Profession</Label>
                      {isEditing ? (
                        <Input
                          id="profession"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Enter your profession"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          {user.profession || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-800">Contact Number</Label>
                      {isEditing ? (
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Enter your contact number"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {user.contactNumber || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="nearestRailwayStation" className="text-sm font-medium text-gray-800">Nearest Railway Station</Label>
                      {isEditing ? (
                        <Input
                          id="nearestRailwayStation"
                          name="nearestRailwayStation"
                          value={formData.nearestRailwayStation}
                          onChange={handleInputChange}
                          className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Enter nearest railway station"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {user.nearestRailwayStation || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NGO-specific fields */}
              {user.role === "ngo" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#7DD9A6]" />
                    Organization Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="organizationType" className="text-sm font-medium text-gray-800">Organization Type</Label>
                        {isEditing ? (
                          <select
                            id="organizationType"
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border-2 border-[#D4E7B8] rounded-lg focus:ring-2 focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          >
                            <option value="">Select type</option>
                            <option value="non-profit">Non-Profit</option>
                            <option value="charity">Charity</option>
                            <option value="foundation">Foundation</option>
                            <option value="trust">Trust</option>
                            <option value="society">Society</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            {user.organizationType || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-800">Website URL</Label>
                        {isEditing ? (
                          <Input
                            id="websiteUrl"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                            placeholder="https://example.com"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Globe className="w-4 h-4 text-gray-500" />
                            {user.websiteUrl || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-800">Contact Number</Label>
                        {isEditing ? (
                          <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                            placeholder="+1234567890"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {user.contactNumber || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ngoDescription" className="text-sm font-medium text-gray-800">Organization Description</Label>
                      {isEditing ? (
                        <textarea
                          id="ngoDescription"
                          name="ngoDescription"
                          value={formData.ngoDescription}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-2 w-full px-4 py-3 border-2 border-[#D4E7B8] rounded-lg focus:ring-2 focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Describe your organization..."
                        />
                      ) : (
                        <p className="mt-2 text-gray-800 bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          {user.ngoDescription || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Address Section for NGO */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#7DD9A6]" />
                        Organization Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="addressStreet" className="text-sm font-medium text-gray-800">Street Address</Label>
                          {isEditing ? (
                            <Input
                              id="addressStreet"
                              name="addressStreet"
                              value={formData.addressStreet}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter street address"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.street || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCity" className="text-sm font-medium text-gray-800">City</Label>
                          {isEditing ? (
                            <Input
                              id="addressCity"
                              name="addressCity"
                              value={formData.addressCity}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter city"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.city || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressState" className="text-sm font-medium text-gray-800">State</Label>
                          {isEditing ? (
                            <Input
                              id="addressState"
                              name="addressState"
                              value={formData.addressState}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter state"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.state || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressZip" className="text-sm font-medium text-gray-800">ZIP Code</Label>
                          {isEditing ? (
                            <Input
                              id="addressZip"
                              name="addressZip"
                              value={formData.addressZip}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter ZIP code"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.zip || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCountry" className="text-sm font-medium text-gray-800">Country</Label>
                          {isEditing ? (
                            <Input
                              id="addressCountry"
                              name="addressCountry"
                              value={formData.addressCountry}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter country"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <Globe className="w-4 h-4 text-gray-500" />
                              {user.address?.country || "Not specified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Corporate-specific fields */}
              {user.role === "corporate" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#7DD9A6]" />
                    Company Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="companyType" className="text-sm font-medium text-gray-800">Company Type</Label>
                        {isEditing ? (
                          <select
                            id="companyType"
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border-2 border-[#D4E7B8] rounded-lg focus:ring-2 focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          >
                            <option value="">Select type</option>
                            <option value="private-limited">Private Limited</option>
                            <option value="public-limited">Public Limited</option>
                            <option value="llp">LLP</option>
                            <option value="partnership">Partnership</option>
                            <option value="mnc">MNC</option>
                            <option value="startup">Startup</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            {user.companyType || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="industrySector" className="text-sm font-medium text-gray-800">Industry Sector</Label>
                        {isEditing ? (
                          <select
                            id="industrySector"
                            name="industrySector"
                            value={formData.industrySector}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border-2 border-[#D4E7B8] rounded-lg focus:ring-2 focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          >
                            <option value="">Select sector</option>
                            <option value="it-software">IT/Software</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="finance">Finance</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="retail">Retail</option>
                            <option value="education">Education</option>
                            <option value="consulting">Consulting</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Target className="w-4 h-4 text-gray-500" />
                            {user.industrySector || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-800">Contact Number</Label>
                        {isEditing ? (
                          <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                            placeholder="+1234567890"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {user.contactNumber || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyDescription" className="text-sm font-medium text-gray-800">Company Description</Label>
                      {isEditing ? (
                        <textarea
                          id="companyDescription"
                          name="companyDescription"
                          value={formData.companyDescription}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-2 w-full px-4 py-3 border-2 border-[#D4E7B8] rounded-lg focus:ring-2 focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                          placeholder="Describe your company..."
                        />
                      ) : (
                        <p className="mt-2 text-gray-800 bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                          {user.companyDescription || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Address Section for Corporate */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#7DD9A6]" />
                        Company Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="addressStreet" className="text-sm font-medium text-gray-800">Street Address</Label>
                          {isEditing ? (
                            <Input
                              id="addressStreet"
                              name="addressStreet"
                              value={formData.addressStreet}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter street address"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.street || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCity" className="text-sm font-medium text-gray-800">City</Label>
                          {isEditing ? (
                            <Input
                              id="addressCity"
                              name="addressCity"
                              value={formData.addressCity}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter city"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.city || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressState" className="text-sm font-medium text-gray-800">State</Label>
                          {isEditing ? (
                            <Input
                              id="addressState"
                              name="addressState"
                              value={formData.addressState}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter state"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.state || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressZip" className="text-sm font-medium text-gray-800">ZIP Code</Label>
                          {isEditing ? (
                            <Input
                              id="addressZip"
                              name="addressZip"
                              value={formData.addressZip}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter ZIP code"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              {user.address?.zip || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCountry" className="text-sm font-medium text-gray-800">Country</Label>
                          {isEditing ? (
                            <Input
                              id="addressCountry"
                              name="addressCountry"
                              value={formData.addressCountry}
                              onChange={handleInputChange}
                              className="mt-2 border-[#D4E7B8] focus:ring-[#7DD9A6] focus:border-[#7DD9A6]"
                              placeholder="Enter country"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-800 font-medium bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                              <Globe className="w-4 h-4 text-gray-500" />
                              {user.address?.country || "Not specified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="pt-6 border-t-2 border-[#D4E7B8]">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  Account Information
                </h3>
                <div className="bg-[#F5F5F5] px-4 py-3 rounded-lg border border-[#D4E7B8]">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-800">Member since:</span>{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Security Settings */}
              <div className="pt-6 border-t-2 border-[#D4E7B8]">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                  Security & Account
                </h3>
                <div className="space-y-3">
                  {/* Change Password Button */}
                  <Button
                    onClick={() => setShowPasswordDialog(true)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4 border-2 border-[#D4E7B8] hover:bg-[#E8F5A5] hover:border-[#7DD9A6]"
                  >
                    <div className="bg-[#E8F5A5] p-2 rounded-lg">
                      <Lock className="w-5 h-5 text-[#6BC794]" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base text-gray-800">Change Password</div>
                      <div className="text-sm text-gray-700">Update your account password</div>
                    </div>
                  </Button>

                  {/* Delete Account Button */}
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4 border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base text-red-700">Delete Account</div>
                      <div className="text-sm text-gray-700">Permanently delete your account and all data</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Picture Dialog */}
      <Dialog open={showProfilePictureDialog} onOpenChange={setShowProfilePictureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Profile Picture</DialogTitle>
            <DialogDescription>
              Choose an option to update or remove your profile picture
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {/* Upload New Picture Button */}
            <Button
              onClick={() => {
                fileInputRef.current?.click();
                setShowProfilePictureDialog(false);
              }}
              className="w-full h-auto py-4 flex items-center justify-start gap-4 bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white"
            >
              <div className="bg-[#6BC794] p-3 rounded-lg">
                <ImagePlus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base">Upload New Picture</div>
                <div className="text-sm text-white/90">Choose a photo from your device</div>
              </div>
            </Button>

            {/* Remove Picture Button - Only show if user has a profile picture */}
            {user?.profilePicture && (
              <Button
                onClick={removeProfilePictureFromServer}
                disabled={isRemovingImage}
                variant="outline"
                className="w-full h-auto py-4 flex items-center justify-start gap-4 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <div className="bg-red-100 p-3 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-left">
                  {isRemovingImage ? (
                    <>
                      <div className="font-semibold text-base text-gray-700">Removing...</div>
                      <div className="text-sm text-gray-500">Please wait</div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-base text-gray-700">Remove Picture</div>
                      <div className="text-sm text-gray-500">Use default avatar instead</div>
                    </>
                  )}
                </div>
              </Button>
            )}

            {/* Cancel Button */}
            <Button
              onClick={() => setShowProfilePictureDialog(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                placeholder="Enter current password"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583]"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100"
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Warning</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>All your posts and comments will be deleted</li>
                <li>Your profile and activity history will be removed</li>
                <li>Your earned coins and badges will be lost</li>
                <li>This action is irreversible</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="deletePassword" className="text-sm font-medium">
                Enter your password to confirm
              </Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isDeletingAccount ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletePassword("");
                }}
                variant="outline"
                disabled={isDeletingAccount}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
