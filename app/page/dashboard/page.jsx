"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { BsCartPlus as CartIcon } from "react-icons/bs";
import { FaSync as ResetIcon, FaTrash as DeleteIcon } from "react-icons/fa";
import { FaChartLine, FaUsers, FaShoppingCart, FaMoneyBillWave, FaCreditCard, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import styles from "@/app/styles/dashboard.module.css";
import { useDashboardStore } from "@/app/store/Dashboard";
import { useAuthStore } from "@/app/store/Auth";
import { useDebtStore } from "@/app/store/Debt";

export default function Dashboard() {
  const { 
    loading: dashboardLoading, 
    error: dashboardError, 
    dashboardData, 
    fetchDashboardData,
    resetDashboardData
  } = useDashboardStore();
  
  const {
    loading: debtLoading,
    error: debtError,
    debts,
    overdueDebts,
    debtStatistics, 
    getAllDebts,
    getOverdueDebtsReport,
    getDebtStatistics, 
    sendReminder,
    deleteAllDebts
  } = useDebtStore();
  
  const { isAdmin } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('top-selling');
  const [isResetting, setIsResetting] = useState(false);
  const [debtView, setDebtView] = useState('summary');
  const [reminderSending, setReminderSending] = useState({});
  const [isDeletingDebts, setIsDeletingDebts] = useState(false);

  const loading = dashboardLoading || debtLoading;
  const error = dashboardError || debtError;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardResult = await fetchDashboardData();
        const debtsResult = await getAllDebts();
        const overdueResult = await getOverdueDebtsReport();
        
        const statisticsResult = await getDebtStatistics();
        
        if (!dashboardResult.success || !debtsResult.success || 
            !overdueResult.success || !statisticsResult.success) {
          toast.error('Failed to load some dashboard data');
        }
      } catch (err) {
        toast.error('Error loading dashboard data');
        console.error(err);
      }
    };
    
    loadData();
  }, [fetchDashboardData, getAllDebts, getOverdueDebtsReport, getDebtStatistics]);
  
  const handleRestock = async (productId) => {
    toast.success(`Added product #${productId} to restock list`);
    // This would typically add the product to the cart or a restock queue
  };

  
  
  const handleResetDashboard = async () => {
    try {
      setIsResetting(true);
      const confirmReset = window.confirm("Are you sure you want to reset dashboard data? This will clear all reports from the current month.");
      
      if (confirmReset) {
        const result = await resetDashboardData();
        
        if (result.success) {
          toast.success(`Dashboard reset successfully. ${result.deletedReports} reports deleted.`);
          await fetchDashboardData();
          await getDebtStatistics();
        } else {
          toast.error("Failed to reset dashboard data");
        }
      }
    } catch (err) {
      toast.error("Error resetting dashboard: " + (err.message || "Unknown error"));
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAllDebts = async () => {
    try {
      setIsDeletingDebts(true);
      const confirmDelete = window.confirm("WARNING: Are you sure you want to delete ALL debt records? This action cannot be undone.");
      
      if (confirmDelete) {
        // Double-check with a second confirmation
        const secondConfirm = window.confirm("Please confirm again. This will permanently delete ALL debt records in the system.");
        
        if (secondConfirm) {
          const result = await deleteAllDebts();
          
          if (result.success) {
            toast.success(`All debt records deleted successfully. ${result.deletedCount} records were removed.`);
            // Refresh debt statistics
            await getDebtStatistics();
          } else {
            toast.error("Failed to delete debt records: " + (result.message || "Unknown error"));
          }
        }
      }
    } catch (err) {
      toast.error("Error deleting debt records: " + (err.message || "Unknown error"));
    } finally {
      setIsDeletingDebts(false);
    }
  };
  
  const handleSendReminder = async (debtId) => {
    try {
      setReminderSending(prev => ({ ...prev, [debtId]: true }));
      const result = await sendReminder(debtId);
      
      if (result.success) {
        toast.success(result.message || "Reminder sent successfully");
        // Refresh debt statistics after sending reminder
        await getDebtStatistics();
      } else {
        toast.error(result.message || "Failed to send reminder");
      }
    } catch (err) {
      toast.error("Error sending reminder: " + (err.message || "Unknown error"));
    } finally {
      setReminderSending(prev => ({ ...prev, [debtId]: false }));
    }
  };
  
  const handleExportData = async () => {
    try {
      const { exportSalesReports } = await import("@/app/store/Report").then(
        (module) => module.useReportStore.getState()
      );
      
      const result = await exportSalesReports({
        period: 'monthly',
        format: 'csv'
      });
      
      if (!result.success) {
        toast.error("Failed to export dashboard data");
      }
    } catch (err) {
      toast.error("Error exporting data: " + (err.message || "Unknown error"));
    }
  };
  
  const prepareDebtStatsData = () => {
    if (debtStatistics?.data) {
      const debtStatusData = [
        { name: 'Current', value: debtStatistics.data.debtStatusDistribution?.current || 0 },
        { name: 'Overdue', value: debtStatistics.data.debtStatusDistribution?.overdue || 0 }
      ];
      
      return {
        totalDebt: debtStatistics.data.totalDebt || 0,
        totalOverdue: debtStatistics.data.overdueAmount || 0,
        overduePercentage: debtStatistics.data.overduePercentage || 0,
        debtCount: debtStatistics.data.activeDebtCount || 0,
        overdueCount: debtStatistics.data.overdueCount || 0,
        debtStatusData
      };
    }
    
    const totalDebt = debts?.reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;
    const totalOverdue = overdueDebts?.reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;
    const overduePercentage = totalDebt > 0 ? (totalOverdue / totalDebt) * 100 : 0;
    
    const debtStatusData = [
      { name: 'Current', value: totalDebt - totalOverdue },
      { name: 'Overdue', value: totalOverdue }
    ];
    
    return {
      totalDebt,
      totalOverdue,
      overduePercentage,
      debtCount: debts?.length || 0,
      overdueCount: overdueDebts?.length || 0,
      debtStatusData
    };
  };
  if (loading && !dashboardData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error && !dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading dashboard data. Please try again later.</p>
        <button 
          className={styles.retryButton}
          onClick={() => {
            fetchDashboardData();
            getDebtStatistics();
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Use fallback data if no dashboard data is available
  const data = dashboardData || {
    date: new Date().toLocaleDateString('en-US'),
    customers: { count: 0, growthPercentage: 0, period: "Since last month" },
    orders: { count: 0, growthPercentage: 0, period: "Since last month" },
    revenue: { 
      current: 0, 
      target: 0, 
      monthlyData: Array(9).fill().map((_, i) => ({ name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][i], Revenue: 0, Profit: 0 }))
    },
    earnings: { amount: 0, growthPercentage: 0, period: "Since last month" },
    growth: { percentage: 0, growthChange: 0, period: "Since last month" },
    topSellingProducts: [],
    outOfStockProducts: [],
    totalSales: 0
  };

  // Get debt metrics
  const debtMetrics = prepareDebtStatsData();
  const COLORS = ['#0088FE', '#FF8042'];

  if (!isAdmin) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1>Dashboard</h1>
        </div>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <div className={styles.headerActions}>
          <div className={styles.dateSelector}>
            <span>{data.date}</span>
            <button className={styles.dropdownButton}>▼</button>
          </div>
          <button 
            className={styles.resetButton}
            onClick={handleResetDashboard}
            disabled={isResetting}
          >
            <ResetIcon /> {isResetting ? 'Resetting...' : 'Reset'}
          </button>
        </div>
      </div>
      
      <div className={styles.statsContainer}>
        {/* Customers Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaUsers />
          </div>
          <div className={styles.statsContent}>
            <h3>Customers</h3>
            <div className={styles.statsValue}>{data.customers.count.toLocaleString()}</div>
            <div className={`${styles.statsChange} ${data.customers.growthPercentage >= 0 ? styles.positive : styles.negative}`}>
              {data.customers.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(data.customers.growthPercentage).toFixed(2)}%
              <span className={styles.period}>{data.customers.period}</span>
            </div>
          </div>
        </div>
        
        {/* Orders Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaShoppingCart />
          </div>
          <div className={styles.statsContent}>
            <h3>Orders</h3>
            <div className={styles.statsValue}>{data.orders.count.toLocaleString()}</div>
            <div className={`${styles.statsChange} ${data.orders.growthPercentage >= 0 ? styles.positive : styles.negative}`}>
              {data.orders.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(data.orders.growthPercentage).toFixed(2)}%
              <span className={styles.period}>{data.orders.period}</span>
            </div>
          </div>
        </div>
        
        {/* Earnings Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.statsContent}>
            <h3>Earnings</h3>
            <div className={styles.statsValue}>${data.earnings.amount.toLocaleString()}</div>
            <div className={`${styles.statsChange} ${data.earnings.growthPercentage >= 0 ? styles.positive : styles.negative}`}>
              {data.earnings.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(data.earnings.growthPercentage).toFixed(2)}%
              <span className={styles.period}>{data.earnings.period}</span>
            </div>
          </div>
        </div>
        
        {/* Growth Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statsContent}>
            <h3>Growth</h3>
            <div className={styles.statsValue}>+ {data.growth.percentage.toFixed(2)}%</div>
            <div className={`${styles.statsChange} ${data.growth.growthChange >= 0 ? styles.positive : styles.negative}`}>
              {data.growth.growthChange >= 0 ? '↑' : '↓'} {Math.abs(data.growth.growthChange).toFixed(2)}%
              <span className={styles.period}>{data.growth.period}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debt Summary Section */}
      <div className={styles.sectionTitle}>
        <h2>Debt Management</h2>
        <div className={styles.sectionActions}>
          <button 
            className={`${styles.dangerButton} ${styles.resetButton}  ${isDeletingDebts ? styles.loadingButton : ''}`}
            onClick={handleDeleteAllDebts}
            disabled={isDeletingDebts || debtLoading}
          >
            <DeleteIcon /> {isDeletingDebts ? 'Deleting...' : 'Delete'} 
          </button>
        </div>
      </div>
      
      <div className={styles.statsContainer}>
        {/* Total Debt Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaCreditCard />
          </div>
          <div className={styles.statsContent}>
            <h3>Total Debt</h3>
            <div className={styles.statsValue}>${debtMetrics.totalDebt.toLocaleString()}</div>
            <div className={styles.statsInfo}>
              <span>{debtMetrics.debtCount} active accounts</span>
            </div>
          </div>
        </div>
        
        {/* Overdue Debt Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaExclamationTriangle className={styles.warningIcon} />
          </div>
          <div className={styles.statsContent}>
            <h3>Overdue Amount</h3>
            <div className={styles.statsValue}>${debtMetrics.totalOverdue.toLocaleString()}</div>
            <div className={`${styles.statsChange} ${styles.negative}`}>
              {debtMetrics.overduePercentage.toFixed(2)}% of total debt
            </div>
          </div>
        </div>
        
        {/* Debt Count Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsCardIcon}>
            <FaUsers />
          </div>
          <div className={styles.statsContent}>
            <h3>Overdue Accounts</h3>
            <div className={styles.statsValue}>{debtMetrics.overdueCount}</div>
            <div className={styles.statsInfo}>
              <span>Requiring attention</span>
            </div>
          </div>
        </div>
        
        {/* Debt Statistics */}
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <h3>Debt Status Distribution</h3>
            <div className={styles.miniChartContainer}>
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie
                    data={debtMetrics.debtStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {debtMetrics.debtStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{backgroundColor: COLORS[0]}}></div>
                  <span>Current</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{backgroundColor: COLORS[1]}}></div>
                  <span>Overdue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.chartsContainer}>
        {/* Revenue Chart */}
        <div className={styles.revenueChart}>
          <div className={styles.chartHeader}>
            <h3>Revenue</h3>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.current}`}></span>
                <span className={styles.legendLabel}>${data.revenue.current.toLocaleString()}</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.target}`}></span>
                <span className={styles.legendLabel}>${data.revenue.target.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.revenue.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Profit" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 8, stroke: "#a855f7", strokeWidth: 2, fill: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.blue}`}></div>
                <span>Revenue</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.purple}`}></div>
                <span>Profit</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Sales Chart */}
        <div className={styles.totalSales}>
          <h3>Total sales</h3>
          <div className={styles.donutChartContainer}>
            <div className={styles.donutChart}>
              <div className={styles.donutInner}>
                <span className={styles.donutValue}>$ {data.totalSales}</span>
                <span className={styles.donutLabel}>Affiliate</span>
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.direct}`}></span>
                <span className={styles.legendLabel}>Direct</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.affiliate}`}></span>
                <span className={styles.legendLabel}>Affiliate</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.online}`}></span>
                <span className={styles.legendLabel}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debt Management Section */}
      <div className={styles.tablesContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'top-selling' ? styles.active : ''}`}
            onClick={() => setActiveTab('top-selling')}
          >
            Top Selling Products
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'out-of-stock' ? styles.active : ''}`}
            onClick={() => setActiveTab('out-of-stock')}
          >
            Out of Stock Products
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'debt-management' ? styles.active : ''}`}
            onClick={() => setActiveTab('debt-management')}
          >
            Debt Management
          </button>
          
          <button className={styles.exportButton} onClick={handleExportData}>
            Export <span>↑</span>
          </button>
        </div>
        
        <div className={styles.tableContent}>
          {activeTab === 'top-selling' && (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>DATE</th>
                  <th>PRICE</th>
                  <th>QUANTITY</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {data.topSellingProducts.length > 0 ? (
                  data.topSellingProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.date}</td>
                      <td>${parseFloat(product.price).toLocaleString()}</td>
                      <td>{product.quantity}</td>
                      <td>${parseFloat(product.amount).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noData}>No product sales data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          
          {activeTab === 'out-of-stock' && (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>SKU</th>
                  <th>LAST STOCKED</th>
                  <th>PRICE</th>
                  <th>SUPPLIER</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {data.outOfStockProducts.length > 0 ? (
                  data.outOfStockProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{product.lastStocked}</td>
                      <td>${product.price.toLocaleString()}</td>
                      <td>{product.supplier}</td>
                      <td>
                        <button 
                          className={styles.restockButton}
                          onClick={() => handleRestock(product.id)}
                        >
                          <CartIcon /> Restock
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.noData}>No out of stock products</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          
          {activeTab === 'debt-management' && (
            <div className={styles.debtManagementContainer}>
              <div className={styles.debtViewTabs}>
                <button 
                  className={`${styles.viewTab} ${debtView === 'summary' ? styles.activeView : ''}`}
                  onClick={() => setDebtView('summary')}
                >
                  All Debts
                </button>
                <button 
                  className={`${styles.viewTab} ${debtView === 'overdue' ? styles.activeView : ''}`}
                  onClick={() => setDebtView('overdue')}
                >
                  Overdue Debts
                </button>
                <button 
                  className={styles.refreshButton}
                  onClick={() => getDebtStatistics()}
                  disabled={debtLoading}
                >
                  <FaSync className={debtLoading ? styles.spinning : ''} /> Refresh
                </button>
              </div>
              
              {debtView === 'summary' && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>DEBTOR NAME</th>
                      <th>AMOUNT</th>
                      <th>DUE DATE</th>
                      <th>STATUS</th>
                      <th>LAST PAYMENT</th>
                      <th>ACTION</th>

                    </tr>
                  </thead>
                  <tbody>
                    {debts && debts.length > 0 ? (
                      debts.map((debt, index) => {
                        // Use the status from the debt object directly
                        const isOverdue = debt.status === 'overdue';
                        
                        return (
                          <tr key={debt._id || index} className={isOverdue ? styles.overdueRow : ''}>
                            <td>{debt.user?.username || debt.debtorName || 'Unknown'}</td>
                            <td>${parseFloat(debt.remainingAmount || debt.amount || 0).toLocaleString()}</td>
                            <td>{new Date(debt.dueDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${isOverdue ? styles.overdueBadge : styles.currentBadge}`}>
                                {debt.status ? debt.status.charAt(0).toUpperCase() + debt.status.slice(1) : 
                                  isOverdue ? 'Overdue' : 'Current'}
                              </span>
                            </td>
                            <td>
                              {debt.paymentHistory && debt.paymentHistory.length > 0 
                                ? new Date(debt.paymentHistory[debt.paymentHistory.length - 1].date).toLocaleDateString() 
                                : 'No payments'}
                            </td>
                            <td>
                              <div className={styles.actionButtons}>
                              
                                {isOverdue && (
                                  <button 
                                    className={styles.reminderButton}
                                    onClick={() => handleSendReminder(debt._id)}
                                    disabled={reminderSending[debt._id]}
                                  >
                                    {reminderSending[debt._id] ? 'Sending...' : 'Send Reminder'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className={styles.noData}>No debt records available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              
              {debtView === 'overdue' && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>DEBTOR NAME</th>
                      <th>AMOUNT</th>
                      <th>DUE DATE</th>
                      <th>DAYS OVERDUE</th>
                      <th>LAST REMINDER</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueDebts && overdueDebts.length > 0 ? (
                      overdueDebts.map((debt, index) => {
                        const dueDate = new Date(debt.dueDate);
                        const today = new Date();
                        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={debt._id || index} className={styles.overdueRow}>
                            <td>{debt.user?.username || debt.debtorName || 'Unknown'}</td>
                            <td>${parseFloat(debt.remainingAmount || debt.amount || 0).toLocaleString()}</td>
                            <td>{new Date(debt.dueDate).toLocaleDateString()}</td>
                            <td>{daysOverdue} days</td>
                            <td>{debt.lastReminderDate ? new Date(debt.lastReminderDate).toLocaleDateString() : 'Never'}</td>
                            <td>
                              <div className={styles.actionButtons}>
                           
                                <button 
                                  className={styles.reminderButton}
                                  onClick={() => handleSendReminder(debt._id)}
                                  disabled={reminderSending[debt._id]}
                                >
                                  {reminderSending[debt._id] ? 'Sending...' : 'Send Reminder'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className={styles.noData}>No overdue debts</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}