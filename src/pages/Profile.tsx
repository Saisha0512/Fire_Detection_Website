import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Building2, MapPin } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  user_type: "authority" | "normal";
  authority_name?: string;
  fire_station?: string;
  badge_number?: string;
  department?: string;
}

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
    authority_name: "",
    fire_station: "",
    badge_number: "",
    department: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        avatar_url: data.avatar_url || "",
        authority_name: data.authority_name || "",
        fire_station: data.fire_station || "",
        badge_number: data.badge_number || "",
        department: data.department || "",
      });
    } catch (error) {
      toast({
        title: "Error fetching profile",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      fetchProfile();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{formData.full_name || "User"}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {profile?.user_type === "authority" ? "Fire Authority" : "Civilian"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {profile?.user_type === "authority" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-primary" />
                      Authority Information
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="authority_name">Authority Name</Label>
                        <Input
                          id="authority_name"
                          value={formData.authority_name}
                          onChange={(e) => setFormData({ ...formData, authority_name: e.target.value })}
                          placeholder="Fire Officer John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="badge_number">Badge Number</Label>
                        <Input
                          id="badge_number"
                          value={formData.badge_number}
                          onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                          placeholder="FO-1234"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fire_station">Fire Station</Label>
                        <Input
                          id="fire_station"
                          value={formData.fire_station}
                          onChange={(e) => setFormData({ ...formData, fire_station: e.target.value })}
                          placeholder="Delhi Fire Station Central"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="Emergency Response"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/manage-locations")}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Monitoring Locations
                  </Button>
                </>
              )}

              {profile?.user_type === "normal" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/request-location")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Request New Location
                </Button>
              )}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
