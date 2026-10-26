import React from 'react';
import { PayrollRecord } from '../../types';
import { Modal } from '../common/Modal';
import { Printer, Download, Building, ShieldCheck, CheckCircle } from 'lucide-react';

interface PayslipModalProps {
  record: PayrollRecord | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const totalEarnings = record.baseSalary + record.allowances + record.bonuses;
  const totalDeductions = record.taxDeduction + record.healthInsurance + record.pension401k;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={Boolean(record)}
      onClose={onClose}
      title="Official Payslip & Statement of Earnings"
      description={`Pay Voucher Reference: ${record.id} · ${record.payPeriod}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 print:p-0">
        {/* Printable Payslip Card */}
        <div id="printable-payslip" className="border border-slate-200 rounded-xl p-6 bg-white space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  S
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">StaffSync Corporation</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">100 Montgomery St, Suite 1800, San Francisco, CA 94104</p>
              <p className="text-[11px] text-slate-400 font-mono">EIN: 94-8821940 · Payroll Division</p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Pay Statement</span>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{record.payPeriod}</p>
              <div className="mt-1 flex items-center justify-end gap-1.5 text-xs text-emerald-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Status: {record.status}</span>
              </div>
            </div>
          </div>

          {/* Employee & Bank Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Employee Name</span>
              <p className="font-semibold text-slate-900 mt-0.5">{record.employeeName}</p>
              <span className="font-mono text-slate-500 text-[11px]">{record.employeeCode}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Job Title</span>
              <p className="font-medium text-slate-800 mt-0.5 truncate">{record.jobTitle}</p>
              <span className="text-slate-500 text-[11px]">{record.departmentName}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Disbursement Method</span>
              <p className="font-medium text-slate-800 mt-0.5">{record.paymentMethod}</p>
              <span className="text-slate-400 text-[11px]">ACH Direct Transfer</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Disbursed Date</span>
              <p className="font-mono text-slate-800 mt-0.5">{record.paymentDate || 'Scheduled (2026-10-19)'}</p>
              <span className="text-emerald-700 font-medium text-[11px]">Cleared</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-semibold text-slate-800 flex justify-between">
                <span>Earnings Description</span>
                <span>Amount (USD)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 space-y-1">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Regular Base Salary</span>
                  <span className="font-mono tabular-nums font-medium">${record.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Standard Allowances</span>
                  <span className="font-mono tabular-nums font-medium">${record.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Performance Bonus / Commission</span>
                  <span className="font-mono tabular-nums font-medium">${record.bonuses.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50/70 border-t border-slate-200 px-3.5 py-2 font-bold text-slate-900 flex justify-between">
                <span>Total Gross Earnings</span>
                <span className="font-mono tabular-nums">${totalEarnings.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-semibold text-slate-800 flex justify-between">
                <span>Withholdings & Taxes</span>
                <span>Amount (USD)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 space-y-1">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Federal & State Income Tax</span>
                  <span className="font-mono tabular-nums font-medium">-${record.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Health, Dental & Vision</span>
                  <span className="font-mono tabular-nums font-medium">-${record.healthInsurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>401(k) Retirement Contribution</span>
                  <span className="font-mono tabular-nums font-medium">-${record.pension401k.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50/70 border-t border-slate-200 px-3.5 py-2 font-bold text-slate-900 flex justify-between">
                <span>Total Statutory Deductions</span>
                <span className="font-mono tabular-nums">-${totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="bg-indigo-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-medium">Net Take-Home Pay</span>
              <p className="text-xs text-indigo-200 mt-0.5">Disbursed directly into registered bank account</p>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
              ${record.netPay.toLocaleString()}
            </div>
          </div>

          {/* Verification stamp */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>StaffSync Automated Payroll Engine · Verification Hash: {record.id.replace('pr-', 'TXN-')}</span>
            <span>Electronic payslip compliant with federal labor guidelines</span>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Payslip</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
