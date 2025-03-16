"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { FaSync as ResetIcon } from "react-icons/fa";
import { FaUsers, FaCreditCard, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import styles from "@/app/styles/dashboard.module.css";
import { useDebtStore } from "@/app/store/Debt";

export default function Debt() {
  const {
    loading: debtLoading,
    error: debtError,
    debts,
    debtStatistics, 
    getAllDebts,
    makePayment,
    getDebtStatistics
  } = useDebtStore();
  
  const [activeTab, setActiveTab] = useState('user-debts');
  const [debtView, setDebtView] = useState('summary');
  const [paymentAmount, setPaymentAmount] = useState({});
  const [processingPayment, setProcessingPayment] = useState({});
  const [paginationParams, setPaginationParams] = useState({
    page: 1,
    limit: 10
  });

  const loading = debtLoading;
  const error = debtError;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const debtsResult = await getAllDebts(paginationParams);
        const statisticsResult = await getDebtStatistics();
        
        if (!debtsResult.success || !statisticsResult.success) {
          toast.error('Failed to load some debt data');
        }
      } catch (err) {
        toast.error('Error loading debt data');
        console.error(err);
      }
    };
    
    loadData();
  }, [getAllDebts, getDebtStatistics, paginationParams]);
  
const handlePayment = async (debtId) => {
  try {
    setProcessingPayment(prev => ({ ...prev, [debtId]: true }));
    
    if (!paymentAmount[debtId] || isNaN(parseFloat(paymentAmount[debtId])) || parseFloat(paymentAmount[debtId]) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    
    const result = await makePayment(debtId, {
      amount: parseFloat(paymentAmount[debtId]),
      paymentMethod: "online", // Add the required paymentMethod field
      notes: "Payment made from dashboard" // Optional additional information
    });
    
    if (result.success) {
      toast.success(result.message || "Payment successful");
      setPaymentAmount(prev => ({ ...prev, [debtId]: "" }));
      
      // Refresh debt data after payment
      await getAllDebts(paginationParams);
      await getDebtStatistics();
    } else {
      toast.error(result.message || "Payment failed");
    }
  } catch (err) {
    toast.error("Error processing payment: " + (err.message || "Unknown error"));
  } finally {
    setProcessingPayment(prev => ({ ...prev, [debtId]: false }));
  }
};
  const handleExportData = async () => {
    try {
      const { exportDebtReports } = await import("@/app/store/Report").then(
        (module) => module.useReportStore.getState()
      );
      
      const result = await exportDebtReports({
        format: 'csv'
      });
      
      if (!result.success) {
        toast.error("Failed to export debt data");
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
    
    // Fallback data calculation if statistics endpoint wasn't successful
    const totalDebt = debts?.reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;
    const overdueDebts = debts?.filter(debt => debt.status === 'overdue') || [];
    const totalOverdue = overdueDebts.reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0) || 0;
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
      overdueCount: overdueDebts.length || 0,
      debtStatusData
    };
  };

  if (loading && !debts) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading debt data...</p>
      </div>
    );
  }
  
  if (error && !debts) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading debt data. Please try again later.</p>
        <button 
          className={styles.retryButton}
          onClick={() => {
            getAllDebts(paginationParams);
            getDebtStatistics();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Get debt metrics
  const debtMetrics = prepareDebtStatsData();
  const COLORS = ['#0088FE', '#FF8042'];
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sectionTitle}>
        <h2>All Debts</h2>
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
      
      <div className={styles.tablesContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'user-debts' ? styles.active : ''}`}
            onClick={() => setActiveTab('user-debts')}
          >
            All Debts
          </button>
          
          <button className={styles.exportButton} onClick={handleExportData}>
            Export <span>↑</span>
          </button>
        </div>
        
        <div className={styles.tableContent}>
          {activeTab === 'user-debts' && (
            <div className={styles.debtManagementContainer}>
              <div className={styles.debtViewTabs}>
                <button 
                  className={styles.refreshButton}
                  onClick={() => {
                    getAllDebts(paginationParams);
                    getDebtStatistics();
                  }}
                  disabled={debtLoading}
                >
                  <FaSync className={debtLoading ? styles.spinning : ''} /> Refresh
                </button>
              </div>
              
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>AMOUNT</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th>LAST PAYMENT</th>
                    <th>PAYMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {debts && debts.length > 0 ? (
                    debts.map((debt, index) => {
                      const isOverdue = debt.status === 'overdue';
                      
                      return (
                        <tr key={debt._id || index} className={isOverdue ? styles.overdueRow : ''}>
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
                            <div className={styles.paymentContainer}>
                              <input
                                type="number"
                                placeholder="Amount"
                                value={paymentAmount[debt._id] || ''}
                                onChange={(e) => setPaymentAmount(prev => ({ ...prev, [debt._id]: e.target.value }))}
                                className={styles.paymentInput}
                              />
                              <button 
                                className={styles.paymentButton}
                                onClick={() => handlePayment(debt._id)}
                                disabled={processingPayment[debt._id]}
                              >
                                {processingPayment[debt._id] ? 'Processing...' : 'Pay'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.noData}>No debt records available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination controls */}
              <div className={styles.pagination}>
                <button 
                  className={styles.paginationButton}
                  disabled={paginationParams.page === 1 || loading}
                  onClick={() => setPaginationParams(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>
                <span>Page {paginationParams.page}</span>
                <button 
                  className={styles.paginationButton}
                  disabled={debts?.length < paginationParams.limit || loading}
                  onClick={() => setPaginationParams(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}