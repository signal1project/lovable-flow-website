import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Building, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserDetailModal from "./UserDetailModal";
import AddNoteModal from "./AddNoteModal";
import UserTable from "./UserTable";
import SearchBar from "./SearchBar";
import FileViewerModal from "./FileViewerModal";
import { RealtimeChannel } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminNotesModal from "./AdminNotesModal";

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

interface FileData {
  id: string;
  file_url: string;
  file_url_path: string;
  file_name: string;
  file_type?: string;
  created_at: string;
  broker_id?: string;
  lender_id?: string;
}

interface Subscriptions {
  profiles: RealtimeChannel;
  brokers: RealtimeChannel;
  lenders: RealtimeChannel;
  brokerFiles: RealtimeChannel;
  lenderFiles: RealtimeChannel;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
  schema: string;
  table: string;
}

declare global {
  interface Window {
    subscriptions?: Subscriptions;
  }
}

const AdminDashboard = () => {
  const { profile, user } = useAuth();
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
  const [selectedNotesUser, setSelectedNotesUser] = useState<UserData | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile || profile.role !== 'admin') return;
    fetchDashboardData();
    // Only run when user/profile/role become valid
  }, [user?.id, profile?.role]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // First fetch all active users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role, full_name, country, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) {
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      if (!profiles) {
        throw new Error('No profiles found');
      }

      // Get all active user IDs
      const activeUserIds = profiles.map(profile => profile.id);
      const activeBrokerIds = profiles.filter(p => p.role === 'broker').map(p => p.id);
      const activeLenderIds = profiles.filter(p => p.role === 'lender').map(p => p.id);

      // Fetch stats with proper filtering
      const [
        lendersResult,
        brokersResult,
        brokerFilesResult,
        lenderFilesResult,
      ] = await Promise.all([
        supabase.from("lenders").select("id", { count: "exact" }).in("id", activeLenderIds),
        supabase.from("brokers").select("id", { count: "exact" }).in("id", activeBrokerIds),
        supabase.from("broker_files").select("id", { count: "exact" }).in("broker_id", activeBrokerIds),
        supabase.from("lender_files").select("id", { count: "exact" }).in("lender_id", activeLenderIds),
      ]);

      if (lendersResult.error) throw new Error(`Failed to fetch lenders: ${lendersResult.error.message}`);
      if (brokersResult.error) throw new Error(`Failed to fetch brokers: ${brokersResult.error.message}`);
      if (brokerFilesResult.error) throw new Error(`Failed to fetch broker files: ${brokerFilesResult.error.message}`);
      if (lenderFilesResult.error) throw new Error(`Failed to fetch lender files: ${lenderFilesResult.error.message}`);

      // Calculate total files
      const totalFiles = (brokerFilesResult.count || 0) + (lenderFilesResult.count || 0);

      setStats({
        totalLenders: lendersResult.count || 0,
        totalBrokers: brokersResult.count || 0,
        totalFiles: totalFiles,
      });

      // Fetch all users with their role-specific data
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          try {
            let roleData = null;

            if (profile.role === "lender") {
              const { data, error } = await supabase
                .from("lenders")
                .select("*")
                .eq("id", profile.id)
                .single();
              
              if (error) throw error;
              roleData = data;
            } else if (profile.role === "broker") {
              const { data, error } = await supabase
                .from("brokers")
                .select("*")
                .eq("id", profile.id)
                .single();
              
              if (error) throw error;
              roleData = data;
            }

            return {
              ...profile,
              lender_data: profile.role === "lender" ? roleData : null,
              broker_data: profile.role === "broker" ? roleData : null,
            };
          } catch (error: any) {
            console.error(`Error fetching data for user ${profile.id}:`, error);
            return {
              ...profile,
              lender_data: null,
              broker_data: null,
            };
          }
        })
      );

      setUsers(usersWithData);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (activeTab === "brokers") {
      filtered = filtered.filter((user) => user.role === "broker");
    } else if (activeTab === "lenders") {
      filtered = filtered.filter((user) => user.role === "lender");
    } else if (activeTab === "admins") {
      filtered = filtered.filter((user) => user.role === "admin");
    }

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

  const handleNotesClick = (user: UserData) => {
    setSelectedNotesUser(user);
    setShowNotesModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      await fetchDashboardData(); // Refresh all stats and users
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to profile changes
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          await handleProfileChange(payload);
        }
      )
      .subscribe();

    // Subscribe to broker changes
    const brokersSubscription = supabase
      .channel('brokers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brokers'
        },
        async (payload) => {
          await handleBrokerChange(payload);
        }
      )
      .subscribe();

    // Subscribe to lender changes
    const lendersSubscription = supabase
      .channel('lenders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lenders'
        },
        async (payload) => {
          await handleLenderChange(payload);
        }
      )
      .subscribe();

    // Subscribe to file changes
    const filesSubscription = supabase
      .channel('files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broker_files'
        },
        async (payload) => {
          await handleFileChange(payload);
        }
      )
      .subscribe();

    const lenderFilesSubscription = supabase
      .channel('lender-files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lender_files'
        },
        async (payload) => {
          await handleFileChange(payload);
        }
      )
      .subscribe();

    // Store subscriptions for cleanup
    window.subscriptions = {
      profiles: profilesSubscription,
      brokers: brokersSubscription,
      lenders: lendersSubscription,
      brokerFiles: filesSubscription,
      lenderFiles: lenderFilesSubscription
    };
  };

  const cleanupSubscriptions = () => {
    if (window.subscriptions) {
      Object.values(window.subscriptions).forEach(subscription => {
        subscription.unsubscribe();
      });
    }
  };

  const handleProfileChange = async (payload: RealtimePayload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'DELETE' || eventType === 'INSERT') {
      await fetchDashboardData();
    } else if (eventType === 'UPDATE') {
      const updatedUser = await fetchUserWithRoleData(newRecord);
      setUsers(prevUsers => {
        const index = prevUsers.findIndex(user => user.id === newRecord.id);
        if (index === -1) {
          return [...prevUsers, updatedUser];
        }
        const newUsers = [...prevUsers];
        newUsers[index] = updatedUser;
        return newUsers;
      });
    }
  };

  const handleBrokerChange = async (payload: RealtimePayload) => {
    const { eventType, new: newRecord } = payload;
    if (eventType === 'DELETE' || eventType === 'INSERT') {
      await fetchDashboardData();
    } else if (eventType === 'UPDATE') {
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === newRecord.id) {
            return {
              ...user,
              broker_data: newRecord
            };
          }
          return user;
        });
      });
    }
  };

  const handleLenderChange = async (payload: RealtimePayload) => {
    const { eventType, new: newRecord } = payload;
    if (eventType === 'DELETE' || eventType === 'INSERT') {
      await fetchDashboardData();
    } else if (eventType === 'UPDATE') {
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === newRecord.id) {
            return {
              ...user,
              lender_data: newRecord
            };
          }
          return user;
        });
      });
    }
  };

  const handleFileChange = async (payload: RealtimePayload) => {
    const { eventType } = payload;
    // Only update file count in state. Do NOT call fetchDashboardData to prevent refresh loops.
    if (eventType === 'INSERT') {
      setStats(prevStats => ({
        ...prevStats,
        totalFiles: prevStats.totalFiles + 1
      }));
    } else if (eventType === 'DELETE') {
      setStats(prevStats => ({
        ...prevStats,
        totalFiles: Math.max(0, prevStats.totalFiles - 1)
      }));
    }
    // Do nothing for UPDATE
  };

  const fetchUserWithRoleData = async (profile: any) => {
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="brokers">Brokers</TabsTrigger>
                <TabsTrigger value="lenders">Lenders</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <UserTable
                  users={filteredUsers}
                  onUserClick={handleUserClick}
                  onAddNote={handleAddNote}
                  onViewFiles={handleViewFiles}
                  onDeleteUser={handleDeleteUser}
                  onNotesClick={handleNotesClick}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
        {selectedNotesUser && (
          <AdminNotesModal
            user={selectedNotesUser}
            open={showNotesModal}
            onOpenChange={setShowNotesModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
