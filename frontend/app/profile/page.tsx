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
        router.push("/auth");
        return;
      }

      if (authUser) {
        try {
          const token = localStorage.getItem("auth-token");
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/user?t=${Date.now()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            }
          );

          const userData = (response.data as any).data.user;
          setUser(userData);
          
          // Initialize form data with complete user data
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            age: userData.age || "",
            city: userData.city || "",
            profession: userData.profession || "",
            // NGO fields
            organizationType: userData.organizationType || "",
            websiteUrl: userData.websiteUrl || "",
            contactNumber: userData.contactNumber || "",
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
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user data",
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
      router.push("/auth");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header Section with Profile Picture */}
        <Card className="overflow-hidden mb-6 shadow-xl border-0">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-2xl ring-4 ring-blue-100">
                  <AvatarImage 
                    src={profilePicturePreview || user.profilePicture} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <User className="w-16 h-16 sm:w-20 sm:h-20" />
                  </AvatarFallback>
                </Avatar>
                
                {/* Camera Icon Overlay - Opens dialog */}
                <button
                  onClick={() => setShowProfilePictureDialog(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
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
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h1>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {/* Display city for volunteers or city from address for NGO/Corporate */}
                  {((user.role === 'user' && user.city) || 
                    ((user.role === 'ngo' || user.role === 'corporate') && user.address?.city)) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
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
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
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
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
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
                      className="flex items-center gap-2"
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
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New profile picture selected
                      </p>
                      <p className="text-xs text-gray-600">{profilePicture.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={uploadProfilePicture}
                      disabled={isUploadingImage}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-blue-900">{user.points || 0}</p>
                  </div>
                  <Award className="w-12 h-12 text-blue-600 opacity-40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">Coins</p>
                    <p className="text-3xl font-bold text-yellow-900">{user.coins || 0}</p>
                  </div>
                  <Coins className="w-12 h-12 text-yellow-600 opacity-40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Hours Volunteered</p>
                    <p className="text-3xl font-bold text-purple-900">{user.volunteeredHours || 0}</p>
                  </div>
                  <Clock className="w-12 h-12 text-purple-600 opacity-40" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Information */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-2xl">Profile Information</CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Common Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-2"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer-specific fields */}
              {user.role === "user" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Additional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
                      {isEditing ? (
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="Enter your age"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {user.age || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="Enter your city"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {user.city || "Not specified"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="profession" className="text-sm font-medium text-gray-700">Profession</Label>
                      {isEditing ? (
                        <Input
                          id="profession"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          className="mt-2"
                          placeholder="Enter your profession"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          {user.profession || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NGO-specific fields */}
              {user.role === "ngo" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Organization Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="organizationType" className="text-sm font-medium text-gray-700">Organization Type</Label>
                        {isEditing ? (
                          <select
                            id="organizationType"
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {user.organizationType || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">Website URL</Label>
                        {isEditing ? (
                          <Input
                            id="websiteUrl"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            className="mt-2"
                            placeholder="https://example.com"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {user.websiteUrl || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">Contact Number</Label>
                        {isEditing ? (
                          <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="mt-2"
                            placeholder="+1234567890"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.contactNumber || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ngoDescription" className="text-sm font-medium text-gray-700">Organization Description</Label>
                      {isEditing ? (
                        <textarea
                          id="ngoDescription"
                          name="ngoDescription"
                          value={formData.ngoDescription}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your organization..."
                        />
                      ) : (
                        <p className="mt-2 text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                          {user.ngoDescription || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Address Section for NGO */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Organization Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="addressStreet" className="text-sm font-medium text-gray-700">Street Address</Label>
                          {isEditing ? (
                            <Input
                              id="addressStreet"
                              name="addressStreet"
                              value={formData.addressStreet}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter street address"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.street || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCity" className="text-sm font-medium text-gray-700">City</Label>
                          {isEditing ? (
                            <Input
                              id="addressCity"
                              name="addressCity"
                              value={formData.addressCity}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter city"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.city || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressState" className="text-sm font-medium text-gray-700">State</Label>
                          {isEditing ? (
                            <Input
                              id="addressState"
                              name="addressState"
                              value={formData.addressState}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter state"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.state || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressZip" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                          {isEditing ? (
                            <Input
                              id="addressZip"
                              name="addressZip"
                              value={formData.addressZip}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter ZIP code"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.zip || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCountry" className="text-sm font-medium text-gray-700">Country</Label>
                          {isEditing ? (
                            <Input
                              id="addressCountry"
                              name="addressCountry"
                              value={formData.addressCountry}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter country"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <Globe className="w-4 h-4 text-gray-400" />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Company Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="companyType" className="text-sm font-medium text-gray-700">Company Type</Label>
                        {isEditing ? (
                          <select
                            id="companyType"
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {user.companyType || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="industrySector" className="text-sm font-medium text-gray-700">Industry Sector</Label>
                        {isEditing ? (
                          <select
                            id="industrySector"
                            name="industrySector"
                            value={formData.industrySector}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Target className="w-4 h-4 text-gray-400" />
                            {user.industrySector || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">Contact Number</Label>
                        {isEditing ? (
                          <Input
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="mt-2"
                            placeholder="+1234567890"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.contactNumber || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyDescription" className="text-sm font-medium text-gray-700">Company Description</Label>
                      {isEditing ? (
                        <textarea
                          id="companyDescription"
                          name="companyDescription"
                          value={formData.companyDescription}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your company..."
                        />
                      ) : (
                        <p className="mt-2 text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                          {user.companyDescription || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Address Section for Corporate */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Company Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="addressStreet" className="text-sm font-medium text-gray-700">Street Address</Label>
                          {isEditing ? (
                            <Input
                              id="addressStreet"
                              name="addressStreet"
                              value={formData.addressStreet}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter street address"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.street || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCity" className="text-sm font-medium text-gray-700">City</Label>
                          {isEditing ? (
                            <Input
                              id="addressCity"
                              name="addressCity"
                              value={formData.addressCity}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter city"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.city || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressState" className="text-sm font-medium text-gray-700">State</Label>
                          {isEditing ? (
                            <Input
                              id="addressState"
                              name="addressState"
                              value={formData.addressState}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter state"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.state || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressZip" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                          {isEditing ? (
                            <Input
                              id="addressZip"
                              name="addressZip"
                              value={formData.addressZip}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter ZIP code"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {user.address?.zip || "Not specified"}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressCountry" className="text-sm font-medium text-gray-700">Country</Label>
                          {isEditing ? (
                            <Input
                              id="addressCountry"
                              name="addressCountry"
                              value={formData.addressCountry}
                              onChange={handleInputChange}
                              className="mt-2"
                              placeholder="Enter country"
                            />
                          ) : (
                            <div className="flex items-center gap-2 mt-2 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                              <Globe className="w-4 h-4 text-gray-400" />
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
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                  Account Information
                </h3>
                <div className="bg-gray-50 px-4 py-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Member since:</span>{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Security Settings */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                  Security & Account
                </h3>
                <div className="space-y-3">
                  {/* Change Password Button */}
                  <Button
                    onClick={() => setShowPasswordDialog(true)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base text-gray-900">Change Password</div>
                      <div className="text-sm text-gray-500">Update your account password</div>
                    </div>
                  </Button>

                  {/* Delete Account Button */}
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-4 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base text-red-700">Delete Account</div>
                      <div className="text-sm text-gray-500">Permanently delete your account and all data</div>
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
              className="w-full h-auto py-4 flex items-center justify-start gap-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <div className="bg-blue-500 p-3 rounded-lg">
                <ImagePlus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base">Upload New Picture</div>
                <div className="text-sm text-blue-100">Choose a photo from your device</div>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
