"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/Auth";
import styles from "@/app/styles/account.module.css";
import { toast } from "sonner"; 

export default function Account() {
  const { 
    isAdmin, 
    username, 
    email, 
    profileImage,
    getAllUsers, 
    getUsersByRole, 
    toggleAdmin, 
    deleteUserAccount, 
    bulkDeleteAccounts 
  } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("allUsers");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [bulkDeleteResults, setBulkDeleteResults] = useState(null);
  const [showBulkResults, setShowBulkResults] = useState(false);

  // Fetch users based on active tab
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        let result;
        
        if (activeTab === "adminUsers") {
          result = await getUsersByRole("admin");
        } else {
          result = await getAllUsers();
        }
        
        if (result.success) {
          setUsers(result.data.users || []);
        } else {
          setError(result.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [activeTab, getAllUsers, getUsersByRole, isAdmin]);

  // Handle admin toggle
  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    if (!confirm(`${isCurrentlyAdmin ? "Remove" : "Grant"} admin privileges?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await toggleAdmin(userId, !isCurrentlyAdmin);
      
      if (result.success) {
        // Update the users list
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAdmin: !isCurrentlyAdmin } : user
        ));
        toast.success(result.message || `Admin privileges ${!isCurrentlyAdmin ? 'granted' : 'revoked'} successfully`);
      } else {
        setError(result.message || "Failed to update admin status");
        toast.error(result.message || "Failed to update admin status");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    // Get user info for better UX messaging
    const userToDelete = users.find(user => user._id === userId);
    if (!userToDelete) return;

    if (!confirm(`Are you sure you want to delete ${userToDelete.username}'s account? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteUserAccount(userId);
      
      if (result.success) {
        // Remove user from the list
        setUsers(users.filter(user => user._id !== userId));
        toast.success(result.message || "User deleted successfully");
        
        // Remove from selected users if they were selected
        if (selectedUsers.includes(userId)) {
          setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
      } else {
        // Handle specific error cases
        if (result.message?.includes("Default admin")) {
          toast.error("Default admin account cannot be deleted");
        } else {
          toast.error(result.message || "Failed to delete user");
        }
        setError(result.message || "Failed to delete user");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      toast.error("An unexpected error occurred while deleting user");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setError("No users selected for deletion");
      toast.error("No users selected for deletion");
      return;
    }
    
    setConfirmDelete(true);
  };

  const confirmBulkDelete = async () => {
    setLoading(true);
    try {
      const result = await bulkDeleteAccounts(selectedUsers);
      
      if (result.success) {
        // Store delete results for display
        setBulkDeleteResults(result.data);

        // Remove deleted users from the list
        if (result.data.deletedCount > 0) {
          // Some users may have been skipped (default admin) so we need to
          // determine which ones were actually deleted
          const skippedIds = result.data.skippedAdminIds || [];
          const failedIds = (result.data.failedDeletions || []).map(failure => failure.userId);
          
          // Successfully deleted users are those that were not skipped or failed
          const deletedUserIds = selectedUsers.filter(
            id => !skippedIds.includes(id) && !failedIds.includes(id)
          );
          
          // Update users list
          setUsers(users.filter(user => !deletedUserIds.includes(user._id)));
        }
        
        setSelectedUsers([]);
        setConfirmDelete(false);
        setShowBulkResults(true);
        
        toast.success(`Successfully deleted ${result.data.deletedCount} user(s)`);
      } else {
        setError(result.message || "Failed to delete users");
        toast.error(result.message || "Failed to delete users");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      toast.error("An unexpected error occurred during bulk deletion");
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection for bulk actions
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === "all") return matchesSearch;
    if (filterRole === "admin") return matchesSearch && user.isAdmin;
    if (filterRole === "regular") return matchesSearch && !user.isAdmin;
    
    return matchesSearch;
  });

  // Cancel bulk delete operation
  const cancelBulkDelete = () => {
    setConfirmDelete(false);
  };

  // Close bulk results modal
  const closeBulkResults = () => {
    setShowBulkResults(false);
    setBulkDeleteResults(null);
  };

  // Toggle select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.accountDashboard}>
        <div className={styles.unauthorizedMessage}>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountDashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.adminProfile}>
          {profileImage && (
            <div className={styles.profileImageContainer}>
              <img src={profileImage} alt={username} className={styles.profileImage} />
            </div>
          )}
          <div className={styles.adminInfo}>
            <h2>{username}</h2>
            <p>{email}</p>
            <span className={styles.adminBadge}>Administrator</span>
          </div>
        </div>
        
        <h1 className={styles.dashboardTitle}>Account Management</h1>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === "allUsers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("allUsers")}
        >
          All Users
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === "adminUsers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("adminUsers")}
        >
          Administrators
        </button>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className={styles.roleFilter}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="regular">Regular Users</option>
          </select>
        </div>
        
        <div className={styles.actionsContainer}>
          <button 
            className={`${styles.bulkDeleteButton} ${selectedUsers.length === 0 ? styles.disabled : ""}`}
            onClick={handleBulkDelete}
            disabled={selectedUsers.length === 0}
          >
            Delete Selected ({selectedUsers.length})
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {loading ? (
        <div className={styles.loadingState}>Loading users...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                      />
                    </td>
                    <td className={styles.userCell}>
                      <div className={styles.userInfo}>
                        <div className={styles.userImageWrapper}>
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.username} 
                              className={styles.userThumbnail}
                            />
                          ) : (
                            <div className={styles.userInitial}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className={styles.userName}>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.userBadge} ${user.isAdmin ? styles.adminBadge : ""}`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button 
                        className={`${styles.actionButton} ${styles.toggleButton}`}
                        onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                      >
                        {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      {confirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Confirm Bulk Deletion</h3>
            <p>Are you sure you want to delete {selectedUsers.length} user accounts?</p>
            <p className={styles.warningText}>This action cannot be undone!</p>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={cancelBulkDelete}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={confirmBulkDelete}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Results Modal */}
      {showBulkResults && bulkDeleteResults && (
        <div className={styles.modalOverlay}>
          <div className={styles.resultsModal}>
            <h3>Bulk Deletion Results</h3>
            
            <div className={styles.resultsSummary}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Successfully Deleted:</span>
                <span className={styles.resultValue}>{bulkDeleteResults.deletedCount}</span>
              </div>
              
              {bulkDeleteResults.failedCount > 0 && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Failed:</span>
                  <span className={styles.resultValue}>{bulkDeleteResults.failedCount}</span>
                </div>
              )}
              
              {bulkDeleteResults.skippedAdminCount > 0 && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Skipped (Default Admin):</span>
                  <span className={styles.resultValue}>{bulkDeleteResults.skippedAdminCount}</span>
                </div>
              )}
            </div>
            
            {bulkDeleteResults.failedDeletions && bulkDeleteResults.failedDeletions.length > 0 && (
              <div className={styles.failedList}>
                <h4>Failed Deletions:</h4>
                <ul>
                  {bulkDeleteResults.failedDeletions.map((failure, index) => (
                    <li key={index}>
                      <span className={styles.failedId}>{failure.userId}</span>: {failure.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button 
                className={styles.confirmButton}
                onClick={closeBulkResults}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}