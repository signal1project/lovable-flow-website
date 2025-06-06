import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserDetailModal from "./UserDetailModal";
import AddNoteModal from "./AddNoteModal";
import UserTable from "./UserTable";
import SearchBar from "./SearchBar";
import FileViewerModal from "./FileViewerModal";

interface DashboardStats {
  totalLenders: number;
  totalBrokers: number;
  totalFiles: number;
}

interface UserData {
  id: string;
  full_name: string;
  role: string;
  country: string;
  created_at: string;
  lender_data?: any;
  broker_data?: any;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLenders: 0,
    totalBrokers: 0,
    totalFiles: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, activeTab]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [lendersResult, brokersResult, filesResult] = await Promise.all([
        supabase.from("lenders").select("id", { count: "exact" }),
        supabase.from("brokers").select("id", { count: "exact" }),
        supabase.from("broker_files").select("id", { count: "exact" }),
      ]);

      setStats({
        totalLenders: lendersResult.count || 0,
        totalBrokers: brokersResult.count || 0,
        totalFiles: filesResult.count || 0,
      });

      // Fetch all users with their role-specific data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Fetched profiles:", profiles); // <-- Add here

      if (profilesError) throw profilesError;

      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          let roleData = null;

          if (profile.role === "lender") {
            const { data } = await supabase
              .from("lenders")
              .select("*")
              .eq("id", profile.id)
              .single();
            roleData = data;
          } else if (profile.role === "broker") {
            const { data } = await supabase
              .from("brokers")
              .select("*")
              .eq("id", profile.id)
              .single();
            roleData = data;
          }

          return {
            ...profile,
            lender_data: profile.role === "lender" ? roleData : null,
            broker_data: profile.role === "broker" ? roleData : null,
          };
        })
      );

      console.log("Users with role data:", usersWithData); // <-- Add here

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role based on active tab
    if (activeTab === "brokers") {
      filtered = filtered.filter((user) => user.role === "broker");
    } else if (activeTab === "lenders") {
      filtered = filtered.filter((user) => user.role === "lender");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleAddNote = (user: UserData) => {
    setSelectedUser(user);
    setShowNoteModal(true);
  };

  const handleViewFiles = (user: UserData) => {
    setSelectedUser(user);
    setShowFileModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, files, and platform overview
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Lenders
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLenders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Brokers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrokers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search users by name, role, or country..."
            />
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="brokers">Brokers</TabsTrigger>
                <TabsTrigger value="lenders">Lenders</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <UserTable
                  users={filteredUsers}
                  onUserClick={handleUserClick}
                  onAddNote={handleAddNote}
                  onViewFiles={handleViewFiles}
                  onDeleteUser={handleDeleteUser}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedUser && (
        <>
          <UserDetailModal
            user={selectedUser}
            open={showUserModal}
            onOpenChange={setShowUserModal}
            onUserUpdated={fetchDashboardData}
          />
          <AddNoteModal
            user={selectedUser}
            open={showNoteModal}
            onOpenChange={setShowNoteModal}
            onNoteAdded={() => {}}
          />
          <FileViewerModal
            user={selectedUser}
            open={showFileModal}
            onOpenChange={setShowFileModal}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
