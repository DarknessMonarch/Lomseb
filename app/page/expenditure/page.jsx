"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/Auth";
import Dropdown from "@/app/components/ExpenditureDropdown";
import { useExpenditureStore } from "@/app/store/Expenditure";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import styles from "@/app/styles/expenditure.module.css";

export default function ExpenditureDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalAmount: 0,
      pendingCount: 0,
    },
    categoryData: [],
    employeeData: [],
    pendingApprovals: [],
    monthlyData: [],
  });

  // Get user info from auth store
  const { isAdmin, userId, username } = useAuthStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    employeeName: "",
    category: "supplies",
    notes: "",
  });

  const [activeExpenditure, setActiveExpenditure] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    getAllExpenditures,
    getExpenditureStatistics,
    createExpenditure,
    deleteExpenditure,
    approveExpenditure,
    loading,
    error,
    expenditureStatistics,
    resetErrors,
  } = useExpenditureStore();

  // Dropdown options
  const categoryOptions = [
    { code: "salary", name: "Salary" },
    { code: "supplies", name: "Supplies" },
    { code: "utilities", name: "Utilities" },
    { code: "maintenance", name: "Maintenance" },
    { code: "miscellaneous", name: "Miscellaneous" },
  ];

  const allCategoriesOptions = [
    { code: "", name: "All Categories" },
    ...categoryOptions
  ];

  const statusOptions = [
    { code: "", name: "All Statuses" },
    { code: "pending", name: "Pending" },
    { code: "approved", name: "Approved" },
    { code: "rejected", name: "Rejected" },
  ];

  const pageSizeOptions = [
    { code: "5", name: "5" },
    { code: "10", name: "10" },
    { code: "20", name: "20" },
    { code: "50", name: "50" },
  ];

  // Fetch expenditure data on component mount and when date range changes
  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        // Show loading toast
        const loadingToast = toast.loading("Loading expenditure data...");

        // Get expenditure statistics
        const statsResult = await getExpenditureStatistics({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        const expendituresResult = await getAllExpenditures({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          status: filterStatus,
          category: filterCategory,
          page: currentPage,
          limit: pageSize,
        });

        let pendingItems = [];
        if (isAdmin) {
          const pendingResult = await getAllExpenditures({
            status: "pending",
            page: 1,
            limit: 10,
          });

          if (pendingResult.success) {
            pendingItems = pendingResult.data;
          }
        }

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        if (!statsResult.success || !expendituresResult.success) {
          toast.error("Failed to load some expenditure data");
        } else {
          toast.success("Expenditure data loaded successfully");
          if (expendituresResult.data) {
            setExpenditures(expendituresResult.data);
            setTotalPages(expendituresResult.totalPages || 1);
          }
        }
      } catch (err) {
        toast.error(
          "Error loading expenditure data: " + (err.message || "Unknown error")
        );
      }
    };

    fetchExpenditureData();
  }, [
    dateRange,
    currentPage,
    pageSize,
    filterStatus,
    filterCategory,
    refreshTrigger,
    getExpenditureStatistics,
    getAllExpenditures,
    isAdmin,
  ]);

  // Process data when expenditure statistics change
  useEffect(() => {
    if (expenditureStatistics) {
      // Process category data
      const categoryData = expenditureStatistics.categorySummary
        ? expenditureStatistics.categorySummary.map((item) => ({
            name: item.category,
            value: item.totalAmount,
            count: item.count,
          }))
        : [];

      // Process employee data
      const employeeData = expenditureStatistics.employeeSummary
        ? expenditureStatistics.employeeSummary.map((item) => ({
            name: item.employeeName,
            value: item.totalAmount,
            count: item.count,
          }))
        : [];

      // Get pending approvals from statistics if available
      const pendingApprovals = expenditureStatistics.pendingExpenditures || [];

      // Process monthly data
      const monthlyData = expenditureStatistics.monthlyData || [];

      // Set dashboard data
      setDashboardData({
        overview: {
          totalAmount: expenditureStatistics.totalAmount || 0,
          pendingCount: expenditureStatistics.pendingCount || 0,
        },
        categoryData,
        employeeData,
        pendingApprovals,
        monthlyData,
      });
    }
  }, [expenditureStatistics]);

  // Initialize form with current username when showing create form
  useEffect(() => {
    if (showCreateForm) {
      setFormData((prev) => ({
        ...prev,
        employeeName: username || "",
      }));
    }
  }, [showCreateForm, username]);

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  // Handle category selection in form
  const handleCategorySelect = (option) => {
    setFormData((prev) => ({
      ...prev,
      category: option.code,
    }));
  };

  // Toggle create form
  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    // Reset form data when opening
    if (!showCreateForm) {
      setFormData({
        amount: "",
        description: "",
        employeeName: username || "",
        category: "supplies",
        notes: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.amount || !formData.description || !formData.employeeName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const expenditureData = {
        ...formData,
        employeeId: userId,
      };

      console.log("Submitting expenditure with data:", expenditureData);

      const result = await createExpenditure(expenditureData);
      if (result.success) {
        toast.success("Expenditure created successfully");
        toggleCreateForm(); // Close the form

        // Refresh data by incrementing the trigger
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(result.message || "Failed to create expenditure");
      }
    } catch (err) {
      toast.error(
        "Error creating expenditure: " + (err.message || "Unknown error")
      );
    }
  };

  // Handle expenditure actions (delete, approve)
  const handleExpenditureAction = async (id, action) => {
    try {
      let actionPromise;
      let successMessage;

      switch (action) {
        case "delete":
          actionPromise = deleteExpenditure(id);
          successMessage = "Expenditure deleted successfully";
          break;
        case "approve":
          actionPromise = approveExpenditure(id);
          successMessage = "Expenditure approved successfully";
          break;
        default:
          toast.error("Invalid action");
          return;
      }

      toast.promise(actionPromise, {
        loading: `Processing ${action} action...`,
        success: () => {
          // Refresh data by incrementing the trigger
          setRefreshTrigger((prev) => prev + 1);
          return successMessage;
        },
        error: (err) =>
          `Failed to ${action} expenditure: ${err.message || "Unknown error"}`,
      });
    } catch (err) {
      toast.error(`Error during ${action}: ${err.message || "Unknown error"}`);
    }
  };

  // View expenditure details
  const viewExpenditureDetails = (expenditure) => {
    setActiveExpenditure(expenditure);
  };

  // Close expenditure details
  const closeExpenditureDetails = () => {
    setActiveExpenditure(null);
  };

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>
            ${payload[0].value.toLocaleString()}
          </p>
          <p className={styles.tooltipCount}>
            {payload[0].payload.count} expenditures
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle filter change
  const handleFilterStatusSelect = (option) => {
    setFilterStatus(option.code);
    setCurrentPage(1);
  };

  const handleFilterCategorySelect = (option) => {
    setFilterCategory(option.code);
    setCurrentPage(1);
  };

  const handlePageSizeSelect = (option) => {
    setPageSize(Number(option.code));
    setCurrentPage(1);
  };

  const NoDataMessage = ({ message }) => (
    <div className={styles.noDataMessage}>
      <p>{message || "No data available"}</p>
    </div>
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const renderApprovalQueue = () => {
    const pendingItems =
      dashboardData.pendingApprovals &&
      dashboardData.pendingApprovals.length > 0
        ? dashboardData.pendingApprovals
        : expenditures.filter((item) => item.status === "pending");

    if (pendingItems.length === 0) {
      return <NoDataMessage message="No pending approvals" />;
    }

    return (
      <div className={styles.approvalQueue}>
        {pendingItems.slice(0, 5).map((item, index) => (
          <div key={index} className={styles.queueItem}>
            <div className={styles.queueItemDetails}>
              <span className={styles.queueItemName}>{item.description}</span>
              <span className={styles.queueItemAmount}>
                ${item.amount.toLocaleString()}
              </span>
            </div>
            <div className={styles.queueItemActions}>
              <button
                onClick={() => viewExpenditureDetails(item)}
                className={styles.viewQueueButton}
              >
                View
              </button>
              <button
                onClick={() => handleExpenditureAction(item._id, "approve")}
                className={styles.quickApproveButton}
                disabled={loading}
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Pagination = () => {
    return (
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || loading}
          className={styles.paginationButton}
        >
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={styles.paginationButton}
        >
          Prev
        </button>
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={styles.paginationButton}
        >
          Next
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className={styles.paginationButton}
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <div className={styles.expenditureContainer}>
      {loading && (
        <div className={styles.loadingOverlay}>Loading expenditure data...</div>
      )}

      <div className={styles.headerSection}>
        <h1>Expenditure</h1>
        <div className={styles.dateRangeFilter}>
          <div className={styles.dateField}>
            <label>Start:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              disabled={loading}
            />
          </div>
          <div className={styles.dateField}>
            <label>End:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button
            className={styles.exportButton}
            onClick={handleExportCSV}
            disabled={loading}
          >
            Export as CSV
          </button>

          <button onClick={toggleCreateForm} className={styles.exportButton}>
            {showCreateForm ? "Cancel" : "Create Expenditure"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.formContainer}>
          <h2>Create New Expenditure</h2>
          <form onSubmit={handleSubmit} className={styles.expenditureForm}>
            <div className={styles.formGroup}>
              <label>Amount ($) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Employee Name *</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <Dropdown
                options={categoryOptions}
                onSelect={handleCategorySelect}
                dropPlaceHolder="Select Category"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className={styles.formButtons}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                Submit Expenditure
              </button>
              <button
                type="button"
                onClick={toggleCreateForm}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.overviewSection}>
        <div className={styles.overviewCards}>
          <div className={styles.overviewCard}>
            <div className={styles.cardValue}>
              ${dashboardData.overview.totalAmount.toLocaleString()}
            </div>
            <div className={styles.cardLabel}>Total Expenditure</div>
          </div>

          <div className={styles.overviewCard}>
            <div className={`${styles.cardValue} ${styles.orange}`}>
              {dashboardData.overview.pendingCount.toLocaleString()}
            </div>
            <div className={`${styles.cardLabel} ${styles.orange}`}>
              Pending Approvals
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartContainer}>
          <div className={styles.sectionHeader}>
            <h2>Expenditure by Category</h2>
          </div>
          {dashboardData.categoryData.length > 0 ? (
            <div className={styles.pieChartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.chartLegend}>
                {dashboardData.categoryData.map((entry, index) => (
                  <div key={`legend-${index}`} className={styles.legendItem}>
                    <div
                      className={styles.legendDot}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>
                      {entry.name}: ${entry.value.toLocaleString()} (
                      {entry.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoDataMessage message="No category data available" />
          )}
        </div>

        {/* Employee Breakdown - Only visible to admins */}
        {isAdmin && (
          <div className={styles.chartContainer}>
            <div className={styles.sectionHeader}>
              <h2>Expenditure by Employee</h2>
            </div>
            {dashboardData.employeeData.length > 0 ? (
              <div className={styles.pieChartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.employeeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {dashboardData.employeeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.chartLegend}>
                  {dashboardData.employeeData.map((entry, index) => (
                    <div key={`legend-${index}`} className={styles.legendItem}>
                      <div
                        className={styles.legendDot}
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span>
                        {entry.name}: ${entry.value.toLocaleString()} (
                        {entry.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <NoDataMessage message="No employee data available" />
            )}
          </div>
        )}
      </div>

      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h2>{isAdmin ? "All Expenditures" : "My Expenditures"}</h2>
          <div className={styles.tableFilters}>
            <div className={styles.filterGroup}>
              <Dropdown
                options={statusOptions}
                onSelect={handleFilterStatusSelect}
                dropPlaceHolder="All Statuses"
              />
            </div>
            <div className={styles.filterGroup}>
              <Dropdown
                options={allCategoriesOptions}
                onSelect={handleFilterCategorySelect}
                dropPlaceHolder="All Categories"
              />
            </div>
            <div className={styles.filterGroup}>
              <Dropdown
                options={pageSizeOptions}
                onSelect={handlePageSizeSelect}
                dropPlaceHolder="10"
              />
            </div>
          </div>
        </div>
        <div className={styles.tableContainer}>
          {expenditures.length > 0 ? (
            <>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Employee</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((item) => (
                    <tr key={item._id}>
                      <td>{item.description}</td>
                      <td>{item.employeeName}</td>
                      <td>${item.amount.toLocaleString()}</td>
                      <td>{item.category}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className={styles.actionButtons}>
                        <button
                          onClick={() => viewExpenditureDetails(item)}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          View
                        </button>

                        {/* Admin-only actions */}
                        {isAdmin && item.status === "pending" && (
                          <button
                            onClick={() =>
                              handleExpenditureAction(item._id, "approve")
                            }
                            className={`${styles.actionButton} ${styles.approveButton}`}
                            disabled={loading}
                          >
                            Approve
                          </button>
                        )}

                        {/* Delete action - available to all users for their own expenditures */}
                        {(isAdmin || item.employeeId === userId) && (
                          <button
                            onClick={() =>
                              handleExpenditureAction(item._id, "delete")
                            }
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination />
            </>
          ) : (
            <NoDataMessage
              message={`No expenditure data available ${
                isAdmin ? "" : "for your account"
              }`}
            />
          )}
        </div>
      </div>

      {/* Expenditure Details Modal */}
      {activeExpenditure && (
        <div className={styles.modalOverlay}>
          <div className={styles.detailsModal}>
            <div className={styles.modalHeader}>
              <h2>Expenditure Details</h2>
              <button
                onClick={closeExpenditureDetails}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Description:</div>
                <div className={styles.detailValue}>
                  {activeExpenditure.description}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Amount:</div>
                <div className={styles.detailValue}>
                  ${activeExpenditure.amount.toLocaleString()}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Employee:</div>
                <div className={styles.detailValue}>
                  {activeExpenditure.employeeName}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Category:</div>
                <div className={styles.detailValue}>
                  {activeExpenditure.category}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Date:</div>
                <div className={styles.detailValue}>
                  {new Date(activeExpenditure.date).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Status:</div>
                <div className={styles.detailValue}>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[activeExpenditure.status]
                    }`}
                  >
                    {activeExpenditure.status}
                  </span>
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Notes:</div>
                <div className={styles.detailValue}>
                  {activeExpenditure.notes || "No notes provided"}
                </div>
              </div>
              {activeExpenditure.approvedBy && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Approved By:</div>
                  <div className={styles.detailValue}>
                    {activeExpenditure.approvedBy.name || "Unknown"}
                  </div>
                </div>
              )}
              {activeExpenditure.approvalDate && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Approval Date:</div>
                  <div className={styles.detailValue}>
                    {new Date(
                      activeExpenditure.approvalDate
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              {/* Admin-only actions in modal */}
              {isAdmin && activeExpenditure.status === "pending" && (
                <button
                  onClick={() => {
                    handleExpenditureAction(activeExpenditure._id, "approve");
                    closeExpenditureDetails();
                  }}
                  className={`${styles.actionButton} ${styles.approveButton}`}
                  disabled={loading}
                >
                  Approve
                </button>
              )}

              {/* Delete action - available to all users for their own expenditures */}
              {(isAdmin || activeExpenditure.employeeId === userId) && (
                <button
                  onClick={() => {
                    handleExpenditureAction(activeExpenditure._id, "delete");
                    closeExpenditureDetails();
                  }}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  disabled={loading}
                >
                  Delete
                </button>
              )}

              <button
                onClick={closeExpenditureDetails}
                className={styles.closeActionButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
          <div className={styles.adminCards}>
            <div className={styles.adminCard}>
              <h3>Top Spenders</h3>
              {dashboardData.employeeData.length > 0 ? (
                <div className={styles.topSpenders}>
                  {[...dashboardData.employeeData]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((employee, index) => (
                      <div key={index} className={styles.spenderItem}>
                        <span className={styles.spenderName}>
                          {employee.name}
                        </span>
                        <span className={styles.spenderAmount}>
                          ${employee.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <NoDataMessage message="No employee data available" />
              )}
            </div>
            <div className={styles.adminCard}>
              <h3>Approval Queue</h3>
              {renderApprovalQueue()}
            </div>
          </div>
      )}

      {isAdmin && (
        <div className={styles.reportSection}>
          <div className={styles.sectionHeader}>
            <h2>Financial Reports</h2>
          </div>
          <div className={styles.reportCards}>
            <div className={styles.reportCard}>
              <h3>Expense Forecasting</h3>
              <p>
                Based on current spending patterns, projected expenses for the
                next quarter:
              </p>
              <div className={styles.forecastValue}>
                ${calculateForecast().toLocaleString()}
              </div>
              <button className={styles.reportButton}>Export Report</button>
            </div>
            <div className={styles.reportCard}>
              <h3>Budget Compliance</h3>  
              <div className={styles.complianceChart}>
                <div
                  className={styles.complianceBar}
                  style={{
                    width: `${Math.min(
                      100,
                      (dashboardData.overview.totalAmount / budgetLimit) * 100
                    )}%`,
                    backgroundColor:
                      dashboardData.overview.totalAmount < budgetLimit * 0.7
                        ? "#4caf50"
                        : dashboardData.overview.totalAmount < budgetLimit * 0.9
                        ? "#ff9800"
                        : "#f44336",
                  }}
                ></div>
              </div>
              <div className={styles.complianceLabels}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p>
                Current Spending: $
                {dashboardData.overview.totalAmount.toLocaleString()} of $
                {budgetLimit.toLocaleString()}(
                {Math.round(
                  (dashboardData.overview.totalAmount / budgetLimit) * 100
                )}
                % of budget)
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper functions

// Calculate forecast based on average monthly spending
function calculateForecast() {
  const data = useExpenditureStore.getState().expenditureStatistics;

  if (!data || !data.monthlyData || data.monthlyData.length === 0) {
    return 0;
  }

  // Calculate average monthly spending
  const totalAmount = data.monthlyData.reduce(
    (sum, month) => sum + month.totalAmount,
    0
  );
  const avgMonthly = totalAmount / data.monthlyData.length;

  return Math.round(avgMonthly * 3);
}

const budgetLimit = 50000;

function handleExportCSV() {
  const expenditures = useExpenditureStore.getState().expenditures?.data || [];
  if (expenditures.length === 0) {
    toast.error("No data to export");
    return;
  }

  const header = "Description,Employee,Amount,Category,Date,Status\n";
  const rows = expenditures
    .map(
      (item) =>
        `"${item.description}","${item.employeeName}",${item.amount},"${
          item.category
        }","${new Date(item.date).toLocaleDateString()}","${item.status}"`
    )
    .join("\n");

  const csvContent = `data:text/csv;charset=utf-8,${header}${rows}`;

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `expenditures_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);

  // Download file
  link.click();
  document.body.removeChild(link);

  toast.success("CSV export successful");
}