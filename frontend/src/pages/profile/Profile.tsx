import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Shield, 
  DollarSign, 
  FileText, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Globe,
  CreditCard,
  Hash,
  Building,
  AlertCircle,
  Save,
  Edit2
} from 'lucide-react';
import { cn } from '../../utils/cn';

import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('My Profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Real role from auth context
  const currentUserRole = user?.role;
  const isOwnProfile = id === 'me';
  
  // Determine if the current viewer is an admin
  const isAdmin = currentUserRole === 'admin';

  // Permission logic: 
  // - Admin can edit everything.
  // - Employee can only edit their own profile, and only limited fields.
  const canEdit = isAdmin || isOwnProfile;

  const tabs = [
    { name: 'My Profile', icon: User },
    { name: 'Resume', icon: FileText },
    { name: 'Private Info', icon: Shield },
    { name: 'Salary Info', icon: DollarSign, adminOnly: true },
    { name: 'Security', icon: Shield },
  ].filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-hrms-lime/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-gray-100 overflow-hidden border-4 border-white shadow-xl">
             <img src="https://i.pravatar.cc/150?u=1" alt="Profile" className="w-full h-full object-cover" />
          </div>
          {isEditing && (
            <button className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">John Doe</h1>
              <span className="px-3 py-1 bg-hrms-lime text-slate-900 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-slate-500 font-medium">Senior Developer • Engineering</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building className="w-4 h-4" />
              <span>Odoo India</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>Gandhinagar, India</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            isEditing ? (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                SAVE CHANGES
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-slate-900 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                EDIT PROFILE
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-white/50 p-2 rounded-3xl border border-gray-50/50 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
              activeTab === tab.name 
                ? "bg-white text-black shadow-sm border border-gray-50" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm min-h-[400px]">
        {activeTab === 'My Profile' && <MyProfileTab isEditing={isEditing} isAdmin={isAdmin} />}
        {activeTab === 'Private Info' && <PrivateInfoTab isEditing={isEditing} isAdmin={isAdmin} />}
        {activeTab === 'Salary Info' && <SalaryInfoTab isEditing={isEditing} />}
        {activeTab === 'Resume' && <ResumeTab />}
        {activeTab === 'Security' && <SecurityTab />}
      </div>
    </div>
  );
};

const MyProfileTab = ({ isEditing, isAdmin }: { isEditing: boolean; isAdmin: boolean }) => {
  const [skills] = useState(['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL']);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">About Me</h3>
          {isEditing && isAdmin ? (
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              placeholder="Tell us about yourself..."
              defaultValue="Senior Full Stack Developer with 8+ years of experience in building scalable web applications. Passionate about clean code and mentorship."
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed">
              Senior Full Stack Developer with 8+ years of experience in building scalable web applications. Passionate about clean code and mentorship.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100">
                {skill}
              </span>
            ))}
            {isEditing && (
              <button className="flex items-center gap-1 px-4 py-2 bg-hrms-lime/20 text-green-700 text-xs font-bold rounded-xl border border-hrms-lime/30 hover:bg-hrms-lime/30 transition-colors">
                <Plus className="w-3 h-3" />
                Add Skill
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">What I love about my job</h3>
          <p className="text-slate-600 text-sm leading-relaxed italic">
            "Solving complex problems and seeing my code impact thousands of users daily."
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Interests & Hobbies</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Hiking, Photography, Chess, and Open Source Contributing.
          </p>
        </div>
      </div>
    </div>
  );
};

const PrivateInfoTab = ({ isEditing, isAdmin }: { isEditing: boolean; isAdmin: boolean }) => {
  const sections: {
    title: string;
    icon: any;
    fields: { label: string; value: string; icon: any; employeeEditable?: boolean }[];
  }[] = [
    {
      title: 'Personal Details',
      icon: User,
      fields: [
        { label: 'Date of Birth', value: '15 May 1992', icon: Calendar },
        { label: 'Nationality', value: 'Indian', icon: Globe },
        { label: 'Gender', value: 'Male', icon: User },
        { label: 'Marital Status', value: 'Single', icon: User },
      ]
    },
    {
      title: 'Contact Information',
      icon: Mail,
      fields: [
        { label: 'Personal Email', value: 'john.doe@gmail.com', icon: Mail, employeeEditable: true },
        { label: 'Mobile', value: '+91 98765 43210', icon: Phone, employeeEditable: true },
        { label: 'Residing Address', value: '123 Tech Park, Gandhinagar', icon: MapPin, employeeEditable: true },
      ]
    },
    {
      title: 'Bank Details',
      icon: CreditCard,
      fields: [
        { label: 'Bank Name', value: 'HDFC Bank', icon: Building },
        { label: 'Account Number', value: '5010042319001', icon: Hash },
        { label: 'IFSC Code', value: 'HDFC0000123', icon: Hash },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
              <section.icon className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.fields.map((field, fIdx) => {
              const fieldEditable = isAdmin || field.employeeEditable;
              
              return (
                <div key={fIdx} className="space-y-2 group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {isEditing ? ( 
                     <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text"
                          defaultValue={field.value}
                          readOnly={!fieldEditable}
                          className={cn(
                            "w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all",
                            !fieldEditable && "opacity-60 cursor-not-allowed"
                          )}
                        />
                     </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl">
                      <field.icon className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-bold text-slate-700">{field.value}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const SalaryInfoTab = ({ isEditing }: { isEditing: boolean }) => {
  const [wage, setWage] = useState(50000);
  const [wagePeriod, setWagePeriod] = useState<'monthly' | 'yearly'>('monthly');

  const basic = wage * 0.5;
  const hra = basic * 0.5;
  const standardAllowance = 4167;
  const performanceBonus = basic * 0.0833;
  const lta = basic * 0.08333;
  const fixedAllowance = wage - (basic + hra + standardAllowance + performanceBonus + lta);

  const components = [
    { name: 'Basic Salary', amount: basic, type: '50% of Wage' },
    { name: 'House Rent Allowance (HRA)', amount: hra, type: '50% of Basic' },
    { name: 'Standard Allowance', amount: standardAllowance, type: 'Fixed' },
    { name: 'Performance Bonus', amount: performanceBonus, type: '8.33% of Basic' },
    { name: 'Leave Travel Allowance', amount: lta, type: '8.333% of Basic' },
    { name: 'Fixed Allowance', amount: fixedAllowance, type: 'Residual' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Salary Configuration</h3>
          <p className="text-sm text-slate-500 font-medium">Auto-recalculated based on Monthly Wage.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
           <div className="flex bg-white rounded-xl shadow-sm p-1">
              <button 
                onClick={() => setWagePeriod('monthly')}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", wagePeriod === 'monthly' ? "bg-black text-white" : "text-slate-400 hover:text-slate-600")}
              >
                MONTHLY
              </button>
              <button 
                onClick={() => setWagePeriod('yearly')}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", wagePeriod === 'yearly' ? "bg-black text-white" : "text-slate-400 hover:text-slate-600")}
              >
                YEARLY
              </button>
           </div>
           <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number"
                value={wage}
                onChange={(e) => setWage(Number(e.target.value))}
                className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-slate-900 w-32 focus:ring-2 focus:ring-hrms-lime outline-none"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Component</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculation</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {components.map((comp, i) => (
                <tr key={i} className="group hover:bg-white transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{comp.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">{comp.type}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹{comp.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-black text-white">
              <tr>
                <td className="px-6 py-5 font-bold">Total Net Wage</td>
                <td></td>
                <td className="px-6 py-5 font-bold text-right text-lg">₹{wage.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Deductions</h4>
                <div className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase">Estimated</div>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Provident Fund (12%)</span>
                   <span className="font-bold text-slate-900">₹{(basic * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Professional Tax</span>
                   <span className="font-bold text-slate-900">₹200</span>
                </div>
                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-900">Total Deductions</span>
                   <span className="font-bold text-red-500">₹{(basic * 0.12 + 200).toLocaleString()}</span>
                </div>
             </div>
          </div>

          <div className="bg-hrms-blue/20 p-6 rounded-3xl border border-hrms-blue/30 flex items-start gap-4">
             <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
             <p className="text-xs text-blue-700 font-medium leading-relaxed">
               PF is calculated based on the basic salary. Professional Tax is a fixed deduction.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResumeTab = () => (
  <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
      <FileText className="w-8 h-8 text-slate-300" />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-slate-900">No Resume Uploaded</h3>
      <p className="text-sm text-slate-400 mt-1">Upload your latest professional resume here.</p>
    </div>
    <button className="px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold flex items-center gap-2">
      <Plus className="w-4 h-4" />
      UPLOAD FILE
    </button>
  </div>
);

const SecurityTab = () => (
  <div className="max-w-md mx-auto py-8 space-y-8">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hrms-lime transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
          <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hrms-lime transition-all" />
        </div>
      </div>
      <button className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200">UPDATE PASSWORD</button>
    </div>
  </div>
);

export default Profile;
