import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  Edit2,
  Upload,
  FileDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { api, Employee } from '../../utils/api';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('My Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for sub-tabs to manage edits
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [whatILove, setWhatILove] = useState('');
  const [interests, setInterests] = useState('');

  // Private Info states
  const [privateInfo, setPrivateInfo] = useState<any>({});

  const currentUserRole = user?.role;
  const isOwnProfile = id === 'me' || id === user?.id;
  const isAdmin = currentUserRole === 'admin';
  const canEdit = isAdmin || isOwnProfile;
  const targetId = id === 'me' ? user?.id : id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployee = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      const data = await api.employees.get(targetId);
      setEmployee(data);
      setAbout(data.about || '');
      setSkills(data.skills ? JSON.parse(data.skills) : []);
      setWhatILove(data.whatILoveAboutMyJob || '');
      setInterests(data.interestsAndHobbies || '');
      setPrivateInfo({
        personalEmail: data.personalEmail || '',
        mobile: data.mobile || '',
        residingAddress: data.residingAddress || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        nationality: data.nationality || '',
        gender: data.gender || '',
        maritalStatus: data.maritalStatus || '',
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        panNo: data.panNo || '',
        uanNo: data.uanNo || '',
        empCode: data.empCode || '',
        jobPosition: data.jobPosition || '',
        department: data.department || '',
        manager: data.manager || '',
        location: data.location || '',
        dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : '',
      });
    } catch (e) {
      console.error('Error fetching employee details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id, user]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'Salary' && isAdmin) {
      setActiveTab('Salary Info');
    }
  }, [searchParams]);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetId) return;

    try {
      await api.employees.uploadFile(targetId, file, 'avatar');
      fetchEmployee();
    } catch (err: any) {
      alert(err.message || 'Failed to upload profile picture.');
    }
  };

  const handleSaveChanges = async () => {
    if (!targetId) return;
    try {
      if (activeTab === 'My Profile') {
        await api.employees.updateProfile(targetId, {
          about,
          skills,
          whatILoveAboutMyJob: whatILove,
          interestsAndHobbies: interests,
        });
      } else if (activeTab === 'Private Info') {
        await api.employees.updatePrivateInfo(targetId, privateInfo);
      }
      setIsEditing(false);
      fetchEmployee();
    } catch (err: any) {
      alert(err.message || 'Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hrms-lime"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <p className="text-slate-400 font-medium">Employee profile not found.</p>
      </div>
    );
  }

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
          <div className="w-32 h-32 rounded-3xl bg-gray-100 overflow-hidden border-4 border-white shadow-xl relative">
             <img 
               src={employee.profilePictureUrl ? `http://localhost:5000${employee.profilePictureUrl}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} 
               alt="Profile" 
               className="w-full h-full object-cover" 
             />
          </div>
          {canEdit && (
            <>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePictureUpload} 
                style={{ display: 'none' }} 
                accept="image/*" 
              />
            </>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
              <span className="px-3 py-1 bg-hrms-lime text-slate-900 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                {employee.role === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
            <p className="text-slate-500 font-medium">{employee.jobPosition || 'No Title'} • {employee.department || 'No Department'}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>{employee.company?.name || 'Company'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{employee.location || 'Not Specified'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (activeTab === 'My Profile' || activeTab === 'Private Info') && (
            isEditing ? (
              <button 
                onClick={handleSaveChanges}
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
            onClick={() => { setActiveTab(tab.name); setIsEditing(false); }}
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
        {activeTab === 'My Profile' && (
          <MyProfileTab 
            isEditing={isEditing} 
            about={about} 
            setAbout={setAbout}
            skills={skills} 
            setSkills={setSkills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            whatILove={whatILove}
            setWhatILove={setWhatILove}
            interests={interests}
            setInterests={setInterests}
          />
        )}
        {activeTab === 'Private Info' && (
          <PrivateInfoTab 
            isEditing={isEditing} 
            isAdmin={isAdmin} 
            privateInfo={privateInfo} 
            setPrivateInfo={setPrivateInfo} 
          />
        )}
        {activeTab === 'Salary Info' && <SalaryInfoTab employeeId={employee.id} />}
        {activeTab === 'Resume' && <ResumeTab employeeId={employee.id} resumeUrl={employee.resumeUrl} fetchEmployee={fetchEmployee} />}
        {activeTab === 'Security' && <SecurityTab />}
      </div>
    </div>
  );
};

// ==========================================
// MY PROFILE TAB
// ==========================================
interface MyProfileTabProps {
  isEditing: boolean;
  about: string;
  setAbout: (v: string) => void;
  skills: string[];
  setSkills: (v: string[]) => void;
  newSkill: string;
  setNewSkill: (v: string) => void;
  whatILove: string;
  setWhatILove: (v: string) => void;
  interests: string;
  setInterests: (v: string) => void;
}

const MyProfileTab: React.FC<MyProfileTabProps> = ({
  isEditing, about, setAbout, skills, setSkills, newSkill, setNewSkill, whatILove, setWhatILove, interests, setInterests
}) => {
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">About Me</h3>
          {isEditing ? (
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all resize-none"
              placeholder="Tell us about yourself..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed">
              {about || 'Write something about yourself...'}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 flex items-center gap-2">
                {skill}
                {isEditing && (
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="flex gap-2 w-full mt-2">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                  placeholder="React"
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-hrms-lime"
                />
                <button type="button" onClick={handleAddSkill} className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">What I love about my job</h3>
          {isEditing ? (
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              value={whatILove}
              onChange={(e) => setWhatILove(e.target.value)}
              placeholder="Collaborative culture, complex problem solving..."
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed italic">
              {whatILove ? `"${whatILove}"` : 'What do you love about your job?'}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Interests & Hobbies</h3>
          {isEditing ? (
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Hiking, reading, chess..."
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed">
              {interests || 'Specify your hobbies or interests.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PRIVATE INFO TAB
// ==========================================
interface PrivateInfoTabProps {
  isEditing: boolean;
  isAdmin: boolean;
  privateInfo: any;
  setPrivateInfo: (v: any) => void;
}

const PrivateInfoTab: React.FC<PrivateInfoTabProps> = ({ isEditing, isAdmin, privateInfo, setPrivateInfo }) => {
  const handleFieldChange = (key: string, value: string) => {
    setPrivateInfo({ ...privateInfo, [key]: value });
  };

  const sections: {
    title: string;
    icon: any;
    fields: { label: string; key: string; icon: any; type?: string; employeeEditable?: boolean }[];
  }[] = [
    {
      title: 'Personal Details',
      icon: User,
      fields: [
        { label: 'Date of Birth', key: 'dateOfBirth', icon: Calendar, type: 'date' },
        { label: 'Nationality', key: 'nationality', icon: Globe, type: 'text' },
        { label: 'Gender', key: 'gender', icon: User, type: 'text' },
        { label: 'Marital Status', key: 'maritalStatus', icon: User, type: 'text' },
      ]
    },
    {
      title: 'Contact Information',
      icon: Mail,
      fields: [
        { label: 'Personal Email', key: 'personalEmail', icon: Mail, type: 'email', employeeEditable: true },
        { label: 'Mobile', key: 'mobile', icon: Phone, type: 'text', employeeEditable: true },
        { label: 'Residing Address', key: 'residingAddress', icon: MapPin, type: 'text', employeeEditable: true },
      ]
    },
    {
      title: 'Bank Details',
      icon: CreditCard,
      fields: [
        { label: 'Bank Name', key: 'bankName', icon: Building, type: 'text' },
        { label: 'Account Number', key: 'accountNumber', icon: Hash, type: 'text' },
        { label: 'IFSC Code', key: 'ifscCode', icon: Hash, type: 'text' },
      ]
    }
  ];

  // Admin Only Fields
  const adminSections = {
    title: 'Employment Details (Admin Only)',
    icon: Shield,
    fields: [
      { label: 'Employee Code', key: 'empCode', icon: Hash },
      { label: 'Job Position', key: 'jobPosition', icon: Shield },
      { label: 'Department', key: 'department', icon: Building },
      { label: 'Location', key: 'location', icon: MapPin },
      { label: 'Date of Joining', key: 'dateOfJoining', icon: Calendar, type: 'date' },
    ]
  };

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
                          type={field.type || 'text'}
                          value={privateInfo[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
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
                      <span className="text-sm font-bold text-slate-700">{privateInfo[field.key] || 'Not Configured'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Admin Specific Sections */}
      {isAdmin && (
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
              <adminSections.icon className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{adminSections.title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.fields.map((field, fIdx) => (
              <div key={fIdx} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                {isEditing ? (
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type={field.type || 'text'}
                      value={privateInfo[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-hrms-lime outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-transparent rounded-2xl">
                    <field.icon className="w-4 h-4 text-slate-300" />
                    <span className="text-sm font-bold text-slate-700">{privateInfo[field.key] || 'Not Configured'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SALARY INFO TAB (Admin Only)
// ==========================================
const SalaryInfoTab = ({ employeeId }: { employeeId: string }) => {
  const [wage, setWage] = useState(0);
  const [wagePeriod, setWagePeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [components, setComponents] = useState<any[]>([]);
  const [pfPercent, setPfPercent] = useState(12);
  const [ptTax, setPtTax] = useState(200);

  const fetchSalary = async () => {
    try {
      const data = await api.salary.get(employeeId);
      setWage(data.wageAmount);
      setWagePeriod(data.wagePeriod as 'monthly' | 'yearly');
      setComponents(data.components);
      setPfPercent(data.pfEmployeePercent);
      setPtTax(data.professionalTax);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, [employeeId]);

  const handleUpdateSalary = async () => {
    try {
      await api.salary.update(employeeId, {
        wageAmount: wage,
        wagePeriod,
        pfEmployeePercent: pfPercent,
        professionalTax: ptTax,
      });
      alert('Salary updated and components recalculated!');
      fetchSalary();
    } catch (err: any) {
      alert(err.message || 'Failed to update salary details.');
    }
  };

  // Find calculations
  const basicComponent = components.find(c => c.name.includes('Basic'));
  const basicAmount = basicComponent ? basicComponent.computedAmount : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Salary Configuration</h3>
          <p className="text-sm text-slate-500 font-medium">Auto-recalculated based on Monthly/Yearly Wage.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
           <div className="flex bg-white rounded-xl shadow-sm p-1">
              <button 
                type="button"
                onClick={() => setWagePeriod('monthly')}
                className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", wagePeriod === 'monthly' ? "bg-black text-white" : "text-slate-400 hover:text-slate-600")}
              >
                MONTHLY
              </button>
              <button 
                type="button"
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
           <button 
             type="button" 
             onClick={handleUpdateSalary}
             className="px-4 py-2 bg-hrms-lime text-slate-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"
           >
             RECALCULATE & SAVE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Component</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculation Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {components.map((comp, i) => (
                <tr key={i} className="group hover:bg-white transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{comp.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">{comp.computationType} ({comp.value})</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">₹{comp.computedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 font-medium">Click "RECALCULATE & SAVE" to initialize components.</td>
                </tr>
              )}
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
                   <span className="text-slate-500 font-medium">Provident Fund ({pfPercent}%)</span>
                   <span className="font-bold text-slate-900">₹{(basicAmount * (pfPercent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Professional Tax</span>
                   <span className="font-bold text-slate-900">₹{ptTax}</span>
                </div>
                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-sm font-bold text-slate-900">Total Deductions</span>
                   <span className="font-bold text-red-500">₹{(basicAmount * (pfPercent / 100) + ptTax).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
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

// ==========================================
// RESUME TAB
// ==========================================
interface ResumeTabProps {
  employeeId: string;
  resumeUrl?: string | null;
  fetchEmployee: () => void;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ employeeId, resumeUrl, fetchEmployee }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await api.employees.uploadFile(employeeId, file, 'resume');
      fetchEmployee();
    } catch (err: any) {
      alert(err.message || 'Failed to upload resume.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-4 animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
        <FileText className="w-8 h-8 text-slate-300" />
      </div>
      <div className="text-center">
        {resumeUrl ? (
          <>
            <h3 className="font-bold text-slate-900">Resume Uploaded</h3>
            <a 
              href={`http://localhost:5000${resumeUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm text-hrms-lime font-bold hover:underline flex items-center gap-1.5 justify-center mt-2"
            >
              <FileDown className="w-4 h-4" /> Download Resume
            </a>
          </>
        ) : (
          <>
            <h3 className="font-bold text-slate-900">No Resume Uploaded</h3>
            <p className="text-sm text-slate-400 mt-1">Upload your latest professional resume here.</p>
          </>
        )}
      </div>
      <button 
        type="button" 
        onClick={() => fileRef.current?.click()}
        className="px-6 py-3 bg-black text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {resumeUrl ? 'UPDATE FILE' : 'UPLOAD FILE'}
      </button>
      <input type="file" ref={fileRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
    </div>
  );
};

// ==========================================
// SECURITY TAB
// ==========================================
const SecurityTab = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.auth.changePassword({ oldPassword, newPassword });
      alert('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
            <input 
              type="password" 
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hrms-lime transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hrms-lime transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hrms-lime transition-all" 
            />
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 active:scale-98 transition-all hover:bg-slate-800">
          UPDATE PASSWORD
        </button>
      </form>
    </div>
  );
};

export default Profile;
