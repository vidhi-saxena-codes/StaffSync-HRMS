import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { PayrollRecord } from '../types';
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Send,
  Building,
  RotateCw
} from 'lucide-react';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { Modal } from '../components/common/Modal';

export const PayrollPage: React.FC = () => {
  const { payrollRecords, processAllPayroll, updatePayrollStatus, addToast } = useHR();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);
  const [isProcessConfirmOpen, setIsProcessConfirmOpen] = useState(false);

  // Totals
  const totalBase = payrollRecords.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalAllowances = payrollRecords.reduce((sum, p) => sum + p.allowances + p.bonuses, 0);
  const totalGross = totalBase + totalAllowances;
  const totalDeductions = payrollRecords.reduce(
    (sum, p) => sum + p.taxDeduction + p.healthInsurance + p.pension401k,
    0
  );
  const totalNet = payrollRecords.reduce((sum, p) => sum + p.netPay, 0);
  const paidCount = payrollRecords.filter((p) => p.status === 'Paid').length;

  const filteredRecords = payrollRecords.filter((rec) => {
    return filterStatus === 'all' || rec.status === filterStatus;
  });

  const handleConfirmDisbursement = () => {
    processAllPayroll();
    setIsProcessConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payroll & Compensation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monthly salary disbursements, tax withholdings, pension deductions, and payslip generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsProcessConfirmOpen(true)}
            disabled={paidCount === payrollRecords.length}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
              paidCount === payrollRecords.length
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {paidCount === payrollRecords.length ? 'Cycle Completed' : 'Process October Payroll'}
            </span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Gross Payroll
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2 tabular-nums">
            ${totalGross.toLocaleString()}
          </div>
          <span className="text-slate-400 text-[11px] mt-1 block">Base + bonuses & allowances</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Statutory Deductions
          </span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-2 tabular-nums">
            -${totalDeductions.toLocaleString()}
          </div>
          <span className="text-slate-400 text-[11px] mt-1 block">Taxes, healthcare & 401(k)</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Net Take-Home Volume
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-2 tabular-nums">
            ${totalNet.toLocaleString()}
          </div>
          <span className="text-slate-400 text-[11px] mt-1 block">Total disbursed to workforce</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Disbursement Cycle
          </span>
          <div className="text-lg font-bold text-slate-900 font-mono mt-2 tabular-nums">
            {paidCount} / {payrollRecords.length} Paid
          </div>
          <span className="text-slate-400 text-[11px] mt-1 block">Pay period: October 2026</span>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">October 2026 Payroll Register</h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">({payrollRecords.length} staff)</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3 font-mono text-right">Base Salary</th>
                <th className="px-4 py-3 font-mono text-right">Allowances</th>
                <th className="px-4 py-3 font-mono text-right">Deductions</th>
                <th className="px-4 py-3 font-mono text-right">Net Pay</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((p) => {
                const deductions = p.taxDeduction + p.healthInsurance + p.pension401k;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.employeeName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {p.employeeName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{p.employeeName}</p>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {p.employeeCode} · {p.departmentName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-right tabular-nums text-slate-800">
                      ${p.baseSalary.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-right tabular-nums text-slate-600">
                      +${(p.allowances + p.bonuses).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-right tabular-nums text-rose-600">
                      -${deductions.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-right tabular-nums font-bold text-slate-900">
                      ${p.netPay.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-slate-600 truncate max-w-[160px]">
                      {p.paymentMethod}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updatePayrollStatus(
                            p.id,
                            p.status === 'Paid' ? 'Processing' : 'Paid'
                          )
                        }
                        className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                          p.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title="Toggle status"
                      >
                        {p.status}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPayslipRecord(p)}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/60 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Payslip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isProcessConfirmOpen}
        onClose={() => setIsProcessConfirmOpen(false)}
        title="Execute October 2026 Payroll Run"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You are about to approve and disburse <strong>${totalNet.toLocaleString()}</strong> net compensation to{' '}
            <strong>{payrollRecords.length} employees</strong> via ACH Direct Transfer.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total:</span>
              <span className="font-mono tabular-nums font-semibold">${totalGross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Deductions:</span>
              <span className="font-mono tabular-nums text-rose-600">-${totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
              <span>Net Disbursement:</span>
              <span className="font-mono tabular-nums">${totalNet.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsProcessConfirmOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDisbursement}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Confirm Disbursement
            </button>
          </div>
        </div>
      </Modal>

      {/* Payslip Modal */}
      <PayslipModal
        record={selectedPayslipRecord}
        onClose={() => setSelectedPayslipRecord(null)}
      />
    </div>
  );
};
