import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { Department } from '../types';
import {
  Building2,
  Users,
  DollarSign,
  Plus,
  Briefcase,
  Edit2,
  Trash2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const DepartmentsPage: React.FC = () => {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment, addToast } = useHR();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDeptRoster, setViewingDeptRoster] = useState<Department | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headName: '',
    budget: 500000,
    openPositions: 1,
    color: 'indigo',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      headName: '',
      budget: 500000,
      openPositions: 1,
      color: 'indigo',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headName: dept.headName,
      budget: dept.budget,
      openPositions: dept.openPositions,
      color: dept.color,
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('Department name and code are required.', 'error');
      return;
    }

    addDepartment({
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || 'Division operational unit',
      headName: formData.headName.trim() || 'Unassigned',
      budget: Number(formData.budget) || 100000,
      openPositions: Number(formData.openPositions) || 0,
      color: formData.color,
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    updateDepartment(editingDept.id, {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      headName: formData.headName.trim(),
      budget: Number(formData.budget),
      openPositions: Number(formData.openPositions),
      color: formData.color,
    });

    setEditingDept(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteDepartment(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Department Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Organizational structure, headcount allocation, and fiscal budgets across business units.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
          const totalStaff = deptEmployees.length;

          return (
            <div
              key={dept.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Department Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 font-mono">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Head: {dept.headName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(dept.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Headcount</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {totalStaff} {totalStaff === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Annual Budget</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ${(dept.budget / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {dept.openPositions > 0 ? (
                    <span className="text-indigo-600 font-semibold">{dept.openPositions} open roles</span>
                  ) : (
                    <span>Fully staffed</span>
                  )}
                </span>

                <button
                  onClick={() => setViewingDeptRoster(dept)}
                  className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <span>View Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Department"
        description="Establish a new business division with budget and leadership assignment."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              placeholder="e.g. Data & Analytics"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                placeholder="DAT"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department Head</label>
              <input
                type="text"
                value={formData.headName}
                onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                placeholder="Lead Director Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              placeholder="Responsibilities and domain..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fiscal Budget ($ USD)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Open Positions</label>
              <input
                type="number"
                value={formData.openPositions}
                onChange={(e) => setFormData({ ...formData, openPositions: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={Boolean(editingDept)}
        onClose={() => setEditingDept(null)}
        title={`Edit Department: ${editingDept?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department Code</label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department Head</label>
              <input
                type="text"
                value={formData.headName}
                onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fiscal Budget ($ USD)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Open Positions</label>
              <input
                type="number"
                value={formData.openPositions}
                onChange={(e) => setFormData({ ...formData, openPositions: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingDept(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Roster Modal */}
      <Modal
        isOpen={Boolean(viewingDeptRoster)}
        onClose={() => setViewingDeptRoster(null)}
        title={`${viewingDeptRoster?.name} Department Staff`}
        description={`Active personnel roster assigned to ${viewingDeptRoster?.code}`}
        maxWidth="lg"
      >
        {viewingDeptRoster && (
          <div className="space-y-3">
            {employees.filter((e) => e.departmentId === viewingDeptRoster.id).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No employees currently assigned to this department.</p>
            ) : (
              employees
                .filter((e) => e.departmentId === viewingDeptRoster.id)
                .map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">{emp.jobTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-600 block tabular-nums">{emp.employeeCode}</span>
                      <span className="text-[11px] text-emerald-700 font-medium">{emp.status}</span>
                    </div>
                  </div>
                ))
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingDeptRoster(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Confirm Department Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete this department? Employees assigned to it will retain their profiles but become unassigned.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setDeletingId(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
