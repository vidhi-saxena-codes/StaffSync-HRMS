import React, { useState, useMemo } from 'react';
import { useHR } from '../context/HRContext';
import { Employee, EmploymentType, EmployeeStatus, Role } from '../types';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  UserCheck,
  Shield,
  Briefcase
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const EmployeesPage: React.FC = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, addToast } = useHR();

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: departments[0]?.id || '',
    jobTitle: '',
    role: 'Employee' as Role,
    employmentType: 'Full-Time' as EmploymentType,
    status: 'Active' as EmployeeStatus,
    salary: 110000,
    location: 'San Francisco, CA',
    joinDate: new Date().toISOString().split('T')[0],
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      jobTitle: '',
      role: 'Employee',
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 110000,
      location: 'San Francisco, CA',
      joinDate: new Date().toISOString().split('T')[0],
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      departmentId: emp.departmentId,
      jobTitle: emp.jobTitle,
      role: emp.role,
      employmentType: emp.employmentType,
      status: emp.status,
      salary: emp.salary,
      location: emp.location,
      joinDate: emp.joinDate,
      emergencyName: emp.emergencyContact?.name || '',
      emergencyRelationship: emp.emergencyContact?.relationship || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      addToast('Please fill in employee name and email address.', 'error');
      return;
    }

    const dept = departments.find((d) => d.id === formData.departmentId) || departments[0];

    addEmployee({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      avatar: '',
      departmentId: dept.id,
      departmentName: dept.name,
      jobTitle: formData.jobTitle.trim() || 'Specialist',
      role: formData.role,
      employmentType: formData.employmentType,
      status: formData.status,
      salary: Number(formData.salary) || 90000,
      location: formData.location.trim() || 'Headquarters',
      joinDate: formData.joinDate,
      emergencyContact: formData.emergencyName
        ? {
            name: formData.emergencyName,
            relationship: formData.emergencyRelationship || 'Family',
            phone: formData.emergencyPhone || '+1 (555) 000-0000',
          }
        : undefined,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const dept = departments.find((d) => d.id === formData.departmentId) || departments[0];

    updateEmployee(editingEmployee.id, {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      departmentId: dept.id,
      departmentName: dept.name,
      jobTitle: formData.jobTitle.trim(),
      role: formData.role,
      employmentType: formData.employmentType,
      status: formData.status,
      salary: Number(formData.salary),
      location: formData.location.trim(),
      joinDate: formData.joinDate,
      emergencyContact: formData.emergencyName
        ? {
            name: formData.emergencyName,
            relationship: formData.emergencyRelationship || 'Family',
            phone: formData.emergencyPhone,
          }
        : undefined,
    });

    setEditingEmployee(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteEmployee(deletingId);
      setDeletingId(null);
      if (viewingEmployee?.id === deletingId) {
        setViewingEmployee(null);
      }
    }
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDepartment === 'all' || emp.departmentId === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      const matchesType = selectedType === 'all' || emp.employmentType === selectedType;

      return matchesSearch && matchesDept && matchesStatus && matchesType;
    });
  }, [employees, searchTerm, selectedDepartment, selectedStatus, selectedType]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee Code',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Role',
      'Status',
      'Salary (USD)',
      'Join Date',
    ];
    const rows = filteredEmployees.map((e) => [
      e.employeeCode,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.departmentName}"`,
      `"${e.jobTitle}"`,
      e.status,
      e.salary,
      e.joinDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staffsync_employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredEmployees.length} employees to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee profiles, roles, organizational assignments, and compensation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Employment Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Data Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Compensation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No employees match current criteria</p>
                    <p className="text-xs mt-1">Try resetting the search terms or filters</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedDepartment('all');
                        setSelectedStatus('all');
                        setSelectedType('all');
                      }}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center shrink-0 text-xs">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block text-left"
                          >
                            {emp.firstName} {emp.lastName}
                          </button>
                          <span className="text-[11px] text-slate-500 block truncate">{emp.jobTitle}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                      {emp.employeeCode}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <span>{emp.departmentName}</span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <span>{emp.employmentType}</span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                      ${emp.salary.toLocaleString()}
                      <span className="text-slate-400 font-sans text-[10px] ml-1">/yr</span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-medium ${
                          emp.status === 'Active'
                            ? 'text-emerald-700'
                            : emp.status === 'On Leave'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer count */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700 font-mono tabular-nums">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-slate-700 font-mono tabular-nums">{employees.length}</strong> employees
          </span>
          <span className="font-mono tabular-nums">StaffSync Core Directory v1.0</span>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Enter the professional, organizational, and compensation details for the new hire."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. Liam"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. Vance"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="liam.vance@staffsync.corp"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Senior Backend Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary ($ USD) *</label>
              <input
                type="number"
                required
                min={20000}
                max={600000}
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Austin, TX (Remote)"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date of Joining</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2">Emergency Contact (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Save & Onboard
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title={`Edit Employee: ${editingEmployee?.firstName} ${editingEmployee?.lastName}`}
        description="Update contact information, organizational placement, and compensation status."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary ($ USD)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detailed Profile Modal */}
      <Modal
        isOpen={Boolean(viewingEmployee)}
        onClose={() => setViewingEmployee(null)}
        title="Employee Master Record"
        maxWidth="lg"
      >
        {viewingEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              {viewingEmployee.avatar ? (
                <img
                  src={viewingEmployee.avatar}
                  alt={viewingEmployee.firstName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center">
                  {viewingEmployee.firstName[0]}
                  {viewingEmployee.lastName[0]}
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {viewingEmployee.firstName} {viewingEmployee.lastName}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{viewingEmployee.jobTitle}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="font-mono text-indigo-600">{viewingEmployee.employeeCode}</span>
                  <span aria-hidden="true">·</span>
                  <span>{viewingEmployee.departmentName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Contact Details</span>
                <p className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${viewingEmployee.email}`} className="hover:underline truncate">
                    {viewingEmployee.email}
                  </a>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingEmployee.phone}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Location & Tenancy</span>
                <p className="font-medium text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingEmployee.location}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined {viewingEmployee.joinDate}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">Compensation & Plan</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  ${viewingEmployee.salary.toLocaleString()} / year
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Monthly Base Salary</span>
                <span className="font-mono tabular-nums">
                  ${Math.round(viewingEmployee.salary / 12).toLocaleString()} / mo
                </span>
              </div>
            </div>

            {viewingEmployee.emergencyContact && (
              <div className="text-xs space-y-1 text-slate-600">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Emergency Contact</span>
                <p className="font-medium text-slate-800">
                  {viewingEmployee.emergencyContact.name} ({viewingEmployee.emergencyContact.relationship})
                </p>
                <p className="font-mono text-slate-500">{viewingEmployee.emergencyContact.phone}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  handleOpenEdit(viewingEmployee);
                  setViewingEmployee(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Confirm Employee Deletion"
        description="Are you sure you want to remove this employee record? This action will archive their profile."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Removing this record will remove active access credentials and disassociate future payroll schedules.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
