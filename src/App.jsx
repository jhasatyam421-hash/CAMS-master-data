import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  Activity, ArrowLeft, Bell, Boxes, BriefcaseBusiness, Check, ChevronDown,
  ChevronRight, CircleAlert, CircleCheck, Clock3, FileText, Mail,
  MapPin, Pencil, Pickaxe, Plus, Power, Search, ShieldCheck, X,
} from 'lucide-react';

const stages = [
  'Auction Notification', 'Plant Mapping', 'Bid Submission', 'EMD Approval',
  'Auction Participation', 'DPR Release', 'EMD Remittance', 'Auction Closure',
  'Order Confirmation', 'Payment Advice', 'Dispatch Planning', 'Material Dispatch',
  'Receipt Confirmation', 'Invoice Processing', 'Quality Verification',
  'Final Settlement', 'Reconciliation', 'Workflow Complete',
];
const departments = ['Procurement', 'Logistics', 'Finance', 'BAG', 'ChiefRM'];
const companies = ['MCL', 'CCL', 'SECL', 'WCL', 'ECL'];
const numberFormat = new Intl.NumberFormat('en-IN');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialEmails = [
  { id: 1, stage: 1, dept: 'BAG', type: 'To', name: 'BAG Finance Team', email: 'bag.finance@tatasteel.com', active: true },
  { id: 2, stage: 1, dept: 'Procurement', type: 'CC', name: 'RM Procurement Head', email: 'rm.procurement@tatasteel.com', active: true },
  { id: 3, stage: 4, dept: 'ChiefRM', type: 'To', name: 'Chief RM Proc', email: 'chief.rm@tatasteel.com', active: true },
  { id: 4, stage: 6, dept: 'Finance', type: 'To', name: 'Finance DPR Team', email: 'finance.dpr@tatasteel.com', active: true },
  { id: 5, stage: 7, dept: 'Logistics', type: 'To', name: 'RM Logistics', email: 'logistics.rm@tatasteel.com', active: true },
  { id: 6, stage: 8, dept: 'ChiefRM', type: 'CC', name: 'Head RM Procurement', email: 'head.rm@tatasteel.com', active: false },
  { id: 7, stage: 8, dept: 'Finance', type: 'To', name: 'Finance Advance Pymt', email: 'fin.advance@tatasteel.com', active: true },
  { id: 8, stage: 13, dept: 'Procurement', type: 'CC', name: 'Proc Manager', email: 'proc.manager@tatasteel.com', active: true },
];
const initialMines = [
  { id: 'M001', name: 'Lingaraj OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M002', name: 'Bharatpur OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M003', name: 'Jagannath OCP', area: 'Talcher', company: 'MCL', active: true },
  { id: 'M004', name: 'Ananta OCP', area: 'Talcher', company: 'MCL', active: true },
  { id: 'M005', name: 'Belpahar OCP', area: 'IB Valley', company: 'MCL', active: false },
  { id: 'M006', name: 'Samaleswari OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M007', name: 'Kulda OCP', area: 'IB Valley', company: 'MCL', active: true },
  { id: 'M008', name: 'Kaniha OCP', area: 'Talcher', company: 'MCL', active: true },
];
const notifications = [
  { id: 'N001', number: 'MCL/EA/2025/001', date: '15 Jan 2025', supplier: 'MCL' },
  { id: 'N002', number: 'MCL/EA/2025/002', date: '10 Feb 2025', supplier: 'MCL' },
];
const initialQuantities = {
  N001: [
    { sno: 1, mine: 'Lingaraj OCP', coalType: 'Thermal Coal', grade: 'G3', qty: 50000 },
    { sno: 2, mine: 'Jagannath OCP', coalType: 'Thermal Coal', grade: 'G4', qty: 30000 },
    { sno: 3, mine: 'Ananta OCP', coalType: 'Thermal Coal', grade: 'G5', qty: 20000 },
    { sno: 4, mine: 'Bharatpur OCP', coalType: 'Washery Rejects', grade: 'WR1', qty: 15000 },
  ],
  N002: [
    { sno: 1, mine: 'Lingaraj OCP', coalType: 'Thermal Coal', grade: 'G2', qty: 60000 },
    { sno: 2, mine: 'Samaleswari OCP', coalType: 'Thermal Coal', grade: 'G3', qty: 40000 },
  ],
};

function App() {
  const [role, setRole] = useState('Procurement');
  const [activeSection, setActiveSection] = useState(null);
  const [emails, setEmails] = useState(initialEmails);
  const [mines, setMines] = useState(initialMines);
  const [quantities, setQuantities] = useState(initialQuantities);
  const [notificationId, setNotificationId] = useState('N001');
  const [toast, setToast] = useState(null);
  const notify = (message, tone = 'success') => {
    setToast({ message, tone, key: Date.now() });
    window.setTimeout(() => setToast(null), 3200);
  };
  const counts = {
    email: emails.length,
    mines: mines.filter((mine) => mine.active).length,
    quantity: (quantities[notificationId] || []).length,
  };
  const toggleSection = (section) => setActiveSection((current) => current === section ? null : section);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="CAMS home">
          <span className="brand-mark"><Boxes size={20} /></span>
          <span className="brand-word">CAMS<span>.</span></span><span className="brand-divider" />
          <span className="brand-product">Coal Auction<br />Management System</span>
        </a>
        <div className="topbar-right">
          <div className="system-status"><i />System online</div>
          <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={18} /><i /></button>
          <label className="role-control">
            <span className="avatar">{role === 'Procurement' ? 'PR' : 'PO'}</span>
            <span className="role-copy"><b>{role}</b><small>Workspace role</small></span>
            <ChevronDown size={15} />
            <select aria-label="Preview access role" value={role} onChange={(event) => setRole(event.target.value)}><option>Procurement</option><option>Plant Operations</option></select>
          </label>
        </div>
      </header>

      <div className="page-frame">
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><span>Administration</span><ChevronRight size={13} /><b>Master data</b></div>
        {role !== 'Procurement' ? <AccessNotice onReturn={() => setRole('Procurement')} /> : (
          <main>
            <section className="page-intro">
              <div><div className="eyebrow"><i /> PROCUREMENT OPERATIONS</div><h1>Master data <span>workspace</span></h1><p>Keep auction reference data current across every stage of the procurement workflow.</p></div>
              <div className="intro-meta"><span><ShieldCheck size={18} /></span><div><b>Procurement access</b><small>Changes are reflected immediately</small></div></div>
            </section>

            <section className="tile-grid" aria-label="Master data sections">
              <MasterTile id="email" title="Email IDs" subtitle="Manage notification recipients" count={`${counts.email} recipients`} active={activeSection === 'email'} dimmed={Boolean(activeSection && activeSection !== 'email')} onClick={() => toggleSection('email')} icon={<Mail size={24} />} />
              <MasterTile id="mines" title="Mine Names" subtitle="Maintain the active mine master" count={`${counts.mines} active mines`} active={activeSection === 'mines'} dimmed={Boolean(activeSection && activeSection !== 'mines')} onClick={() => toggleSection('mines')} icon={<Pickaxe size={24} />} />
              <MasterTile id="quantity" title="Offered Quantity" subtitle="Update quantities per auction" count={`${counts.quantity} mine rows`} active={activeSection === 'quantity'} dimmed={Boolean(activeSection && activeSection !== 'quantity')} onClick={() => toggleSection('quantity')} icon={<Boxes size={24} />} />
            </section>

            {activeSection === 'email' && <EmailSection data={emails} setData={setEmails} notify={notify} />}
            {activeSection === 'mines' && <MineSection data={mines} setData={setMines} notify={notify} />}
            {activeSection === 'quantity' && <QuantitySection data={quantities} setData={setQuantities} notificationId={notificationId} setNotificationId={setNotificationId} notify={notify} />}

            <footer className="page-footer"><span>COAL AUCTION MANAGEMENT SYSTEM <i>·</i> INTERNAL USE</span><span><Clock3 size={13} />Reference data workspace</span></footer>
          </main>
        )}
      </div>
      {toast && <Toast key={toast.key} message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />}
    </div>
  );
}

function MasterTile({ id, title, subtitle, count, active, dimmed, onClick, icon }) {
  return <button className={`master-tile tile-${id}${active ? ' active' : ''}${dimmed ? ' dimmed' : ''}`} type="button" onClick={onClick} aria-pressed={active}>
    <span className="tile-topline"><span className="tile-icon">{icon}</span><ChevronRight size={17} className="tile-arrow" /></span>
    <span className="tile-title">{title}</span><span className="tile-subtitle">{subtitle}</span><span className="tile-count">{count}</span>
  </button>;
}

function PanelHeading({ id, icon, title, description, action }) {
  return <div className="panel-heading"><div className="panel-heading-title"><span className="panel-heading-icon">{icon}</span><div><h2 id={id}>{title}</h2><p>{description}</p></div></div>{action}</div>;
}

function EmailSection({ data, setData, notify }) {
  const [showForm, setShowForm] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ stage: '1', dept: '', type: 'To', name: '', email: '', active: true });
  const [emailTouched, setEmailTouched] = useState(false);
  const invalidEmail = emailTouched && form.email.length > 0 && !emailPattern.test(form.email);
  const filtered = useMemo(() => data.filter((entry) => {
    const query = search.trim().toLowerCase();
    return (stageFilter === 'all' || String(entry.stage) === stageFilter)
      && (deptFilter === 'all' || entry.dept === deptFilter)
      && (typeFilter === 'all' || entry.type === typeFilter)
      && (!query || `${entry.name} ${entry.email} ${entry.dept}`.toLowerCase().includes(query));
  }), [data, stageFilter, deptFilter, typeFilter, search]);

  const save = (event) => {
    event.preventDefault();
    setEmailTouched(true);
    if (!form.dept || !form.email.trim() || !emailPattern.test(form.email.trim())) return;
    setData((current) => [{ id: Math.max(0, ...current.map((entry) => entry.id)) + 1, ...form, stage: Number(form.stage), name: form.name.trim(), email: form.email.trim() }, ...current]);
    setForm({ stage: '1', dept: '', type: 'To', name: '', email: '', active: true });
    setEmailTouched(false); setShowForm(false); notify('Email added successfully');
  };
  const remove = async (entry) => {
    const result = await Swal.fire({ title: 'Remove this email?', text: `Email: ${entry.email} will no longer receive notifications.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Remove', cancelButtonText: 'Cancel', confirmButtonColor: '#e74c3c', cancelButtonColor: '#667eea', reverseButtons: true });
    if (result.isConfirmed) { setData((current) => current.filter((item) => item.id !== entry.id)); notify('Email removed successfully'); }
  };

  return <section className="management-panel animate-panel" aria-labelledby="email-title">
    <PanelHeading id="email-title" icon={<Mail size={19} />} title="Email IDs management" description="Notification recipients by workflow stage" action={<button className="button button-primary" type="button" onClick={() => setShowForm((value) => !value)}><Plus size={16} />Add new email</button>} />
    <div className="filter-toolbar"><div className="filter-group">
      <SelectFilter title="Stage" value={stageFilter} onChange={setStageFilter} options={stages.map((stage, index) => [String(index + 1), `${String(index + 1).padStart(2, '0')} · ${stage}`])} allLabel="All stages" />
      <SelectFilter title="Department" value={deptFilter} onChange={setDeptFilter} options={departments.map((dept) => [dept, dept])} allLabel="All departments" />
      <div className="segmented-control" aria-label="Recipient type">{['all', 'To', 'CC'].map((type) => <button type="button" key={type} className={typeFilter === type ? 'selected' : ''} onClick={() => setTypeFilter(type)}>{type === 'all' ? 'All' : type}</button>)}</div>
    </div><SearchField value={search} onChange={setSearch} placeholder="Search name or email" /></div>

    {showForm && <form className="inline-form" onSubmit={save} noValidate>
      <FormTitle title="Add notification recipient" subtitle="Choose the workflow stage and recipient details." onClose={() => { setShowForm(false); setEmailTouched(false); }} />
      <div className="form-grid email-form-grid">
        <label className="field"><span>Workflow stage <em>*</em></span><select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>{stages.map((stage, index) => <option value={index + 1} key={stage}>{String(index + 1).padStart(2, '0')} · {stage}</option>)}</select></label>
        <label className="field"><span>Department <em>*</em></span><select value={form.dept} onChange={(event) => setForm({ ...form, dept: event.target.value })}><option value="">Select department</option>{departments.map((dept) => <option key={dept}>{dept}</option>)}</select></label>
        <fieldset className="field type-field"><legend>Recipient type <em>*</em></legend><div className="radio-options">{['To', 'CC'].map((type) => <label key={type}><input type="radio" name="recipient-type" checked={form.type === type} onChange={() => setForm({ ...form, type })} /><span>{type}</span><small>{type === 'To' ? 'Action taker' : 'For information'}</small></label>)}</div></fieldset>
        <label className="field"><span>Name / label</span><input maxLength={100} placeholder="e.g. Finance DPR Team" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="field"><span>Email address <em>*</em></span><input type="email" maxLength={150} className={invalidEmail ? 'input-error' : ''} placeholder="name@company.com" value={form.email} onBlur={() => setEmailTouched(true)} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={invalidEmail} />{invalidEmail && <small className="field-error">Please enter a valid email address</small>}</label>
        <div className="field active-field"><span>Recipient status</span><StatusSwitch checked={form.active} onChange={() => setForm({ ...form, active: !form.active })} label="Recipient active" /></div>
      </div>
      <FormActions onCancel={() => { setShowForm(false); setEmailTouched(false); }} submitLabel="Save recipient" disabled={!form.dept || !form.email.trim()} />
    </form>}

    <TableMeta count={filtered.length} label="recipients shown" />
    <div className="table-scroll"><table className="data-table email-table"><thead><tr><th className="number-col">S.No</th><th>Stage</th><th>Department</th><th>Type</th><th>Name / label</th><th>Email address</th><th>Status</th><th className="actions-col">Actions</th></tr></thead><tbody>
      {filtered.map((entry, index) => <tr key={entry.id}>
        <td className="number-cell">{String(index + 1).padStart(2, '0')}</td><td><span className="stage-chip">{String(entry.stage).padStart(2, '0')}</span><span className="stage-name">{stages[entry.stage - 1]}</span></td>
        <td><span className="department-label"><i className={`department-dot dept-${entry.dept.toLowerCase()}`} />{entry.dept}</span></td><td><span className={`type-badge type-${entry.type.toLowerCase()}`}>{entry.type}</span></td>
        <td className="name-cell">{entry.name || <span className="muted-dash">—</span>}</td><td className="email-cell">{entry.email}</td>
        <td><StatusSwitch checked={entry.active} onChange={() => setData((current) => current.map((item) => item.id === entry.id ? { ...item, active: !item.active } : item))} label={`${entry.email} active`} /></td>
        <td><div className="row-actions"><button className="icon-button danger-icon" type="button" onClick={() => remove(entry)} aria-label={`Remove ${entry.email}`} title="Remove email"><X size={16} /></button></div></td>
      </tr>)}
      {!filtered.length && <EmptyRow columns={8} message="No recipients match these filters." />}
    </tbody></table></div>
    <div className="panel-footnote"><ShieldCheck size={14} />Inactive recipients are skipped silently when workflow notifications are sent.</div>
  </section>;
}

function MineSection({ data, setData, notify }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ name: '', area: '', company: 'MCL', active: true });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', area: '' });
  const areas = [...new Set(data.map((mine) => mine.area).filter(Boolean))].sort();
  const nextId = `M${String(Math.max(0, ...data.map((mine) => Number(mine.id.slice(1)))) + 1).padStart(3, '0')}`;
  const activeCount = data.filter((mine) => mine.active).length;
  const filtered = useMemo(() => data.filter((mine) => {
    const query = search.trim().toLowerCase();
    return (!query || `${mine.name} ${mine.area} ${mine.company}`.toLowerCase().includes(query))
      && (companyFilter === 'all' || mine.company === companyFilter)
      && (areaFilter === 'all' || mine.area === areaFilter)
      && (statusFilter === 'all' || (statusFilter === 'active' ? mine.active : !mine.active));
  }), [data, search, companyFilter, areaFilter, statusFilter]);

  const saveNew = (event) => {
    event.preventDefault(); const name = form.name.trim();
    if (!name) { setFormError('Mine name is required.'); return; }
    if (data.some((mine) => mine.name.toLowerCase() === name.toLowerCase())) { setFormError('Mine name already exists. Please use a different name.'); return; }
    setData((current) => [{ id: nextId, ...form, name, area: form.area.trim() }, ...current]);
    setForm({ name: '', area: '', company: 'MCL', active: true }); setFormError(''); setShowForm(false); notify('Mine added successfully');
  };
  const saveEdit = (mine) => {
    const name = draft.name.trim();
    if (!name || data.some((entry) => entry.id !== mine.id && entry.name.toLowerCase() === name.toLowerCase())) {
      notify(name ? 'Mine name already exists. Please use a different name.' : 'Mine name is required.', 'error'); return;
    }
    setData((current) => current.map((entry) => entry.id === mine.id ? { ...entry, name, area: draft.area.trim() } : entry));
    setEditingId(null); notify('Mine updated successfully');
  };
  const toggleMine = async (mine) => {
    if (mine.active) {
      const result = await Swal.fire({ title: 'Deactivate this mine?', text: `${mine.name} will no longer be available in auction dropdowns. Historical auction records will be preserved.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Deactivate', cancelButtonText: 'Cancel', confirmButtonColor: '#e74c3c', cancelButtonColor: '#667eea', reverseButtons: true });
      if (!result.isConfirmed) return;
    }
    setData((current) => current.map((entry) => entry.id === mine.id ? { ...entry, active: !entry.active } : entry));
    notify(mine.active ? 'Mine deactivated' : 'Mine activated');
  };

  return <section className="management-panel animate-panel" aria-labelledby="mines-title">
    <PanelHeading id="mines-title" icon={<Pickaxe size={19} />} title="Mine names management" description="Maintain the searchable mine master list" action={<button className="button button-primary" type="button" onClick={() => { setShowForm((value) => !value); setFormError(''); }}><Plus size={16} />Add new mine</button>} />
    <div className="filter-toolbar"><div className="filter-group">
      <SelectFilter title="Company" value={companyFilter} onChange={setCompanyFilter} options={companies.map((company) => [company, company])} allLabel="All companies" />
      <SelectFilter title="Area" value={areaFilter} onChange={setAreaFilter} options={areas.map((area) => [area, area])} allLabel="All areas" />
      <div className="segmented-control" aria-label="Mine status">{[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([value, label]) => <button type="button" key={value} className={statusFilter === value ? 'selected' : ''} onClick={() => setStatusFilter(value)}>{label}</button>)}</div>
    </div><SearchField value={search} onChange={setSearch} placeholder="Search mine or area" /></div>

    {showForm && <form className="inline-form" onSubmit={saveNew}>
      <FormTitle title="Add mine to master list" subtitle="New mine ID is generated automatically." onClose={() => { setShowForm(false); setFormError(''); }} />
      <div className="form-grid mine-form-grid">
        <label className="field"><span>Mine ID</span><input value={nextId} readOnly className="readonly-field" /></label>
        <label className="field"><span>Mine name <em>*</em></span><input maxLength={150} placeholder="e.g. Lingaraj OCP" value={form.name} onChange={(event) => { setForm({ ...form, name: event.target.value }); setFormError(''); }} /></label>
        <label className="field"><span>Area / region</span><input maxLength={100} placeholder="e.g. IB Valley" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} /></label>
        <label className="field"><span>Operating company</span><select value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })}>{companies.map((company) => <option key={company}>{company}</option>)}</select></label>
        <div className="field active-field"><span>Active status</span><StatusSwitch checked={form.active} onChange={() => setForm({ ...form, active: !form.active })} label="New mine active" /></div>
      </div>
      {formError && <div className="form-error"><CircleAlert size={14} />{formError}</div>}
      <FormActions onCancel={() => { setShowForm(false); setFormError(''); }} submitLabel="Save mine" disabled={!form.name.trim()} />
    </form>}

    <div className="table-meta"><span><b>{filtered.length}</b> of {data.length} mines</span><span className="mine-summary"><span className="summary-active"><i />{activeCount} active</span><span className="summary-inactive"><i />{data.length - activeCount} inactive</span></span></div>
    <div className="table-scroll"><table className="data-table mine-table"><thead><tr><th className="number-col">S.No</th><th>Mine ID</th><th>Mine name</th><th>Area / region</th><th>Status</th><th className="actions-col">Actions</th></tr></thead><tbody>
      {filtered.map((mine, index) => <tr key={mine.id} className={editingId === mine.id ? 'editing-row' : ''}>
        <td className="number-cell">{String(index + 1).padStart(2, '0')}</td><td><span className="mine-id">{mine.id}</span></td>
        <td>{editingId === mine.id ? <input className="table-input" maxLength={150} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-label="Mine name" /> : <><span className="mine-name">{mine.name}</span><span className="mine-company">{mine.company}</span></>}</td>
        <td>{editingId === mine.id ? <input className="table-input" maxLength={100} value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })} aria-label="Area or region" /> : <span className="area-label"><MapPin size={13} />{mine.area || '—'}</span>}</td>
        <td><span className={`status-badge ${mine.active ? 'is-active' : 'is-inactive'}`}><i />{mine.active ? 'Active' : 'Inactive'}</span></td>
        <td><div className="row-actions">{editingId === mine.id ? <><button className="icon-button save-icon" type="button" onClick={() => saveEdit(mine)} aria-label="Save mine" title="Save"><Check size={16} /></button><button className="icon-button cancel-icon" type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing" title="Cancel"><X size={16} /></button></> : <><button className="icon-button edit-icon" type="button" onClick={() => { setEditingId(mine.id); setDraft({ name: mine.name, area: mine.area }); }} aria-label={`Edit ${mine.name}`} title="Edit mine"><Pencil size={15} /></button><button className={`icon-button ${mine.active ? 'danger-icon' : 'restore-icon'}`} type="button" onClick={() => toggleMine(mine)} aria-label={mine.active ? `Deactivate ${mine.name}` : `Activate ${mine.name}`} title={mine.active ? 'Deactivate mine' : 'Activate mine'}><Power size={15} /></button></>}</div></td>
      </tr>)}
      {!filtered.length && <EmptyRow columns={6} message="No mines match these filters." />}
    </tbody></table></div>
    <div className="panel-footnote"><ShieldCheck size={14} />Deactivating a mine hides it from dropdowns but preserves historical auction records.</div>
  </section>;
}

function QuantitySection({ data, setData, notificationId, setNotificationId, notify }) {
  const [editingRows, setEditingRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [errorRow, setErrorRow] = useState(null);
  const current = notifications.find((notification) => notification.id === notificationId);
  const rows = data[notificationId] || [];
  const total = rows.reduce((sum, row) => sum + row.qty, 0);
  const invalid = (value) => !/^\d+$/.test(String(value)) || Number(value) < 1;
  const saveRow = (row) => {
    const value = drafts[row.sno] ?? String(row.qty);
    if (invalid(value)) { setErrorRow(row.sno); return; }
    setData((currentData) => ({ ...currentData, [notificationId]: currentData[notificationId].map((item) => item.sno === row.sno ? { ...item, qty: Number(value) } : item) }));
    setDrafts((currentDrafts) => { const next = { ...currentDrafts }; delete next[row.sno]; return next; });
    setEditingRows((currentRows) => currentRows.filter((sno) => sno !== row.sno)); setErrorRow(null); notify(`Quantity updated for ${row.mine}`);
  };
  const saveAll = () => {
    const pending = rows.filter((row) => Object.hasOwn(drafts, row.sno));
    if (!pending.length) return;
    const bad = pending.find((row) => invalid(drafts[row.sno]));
    if (bad) { setEditingRows((currentRows) => currentRows.includes(bad.sno) ? currentRows : [...currentRows, bad.sno]); setErrorRow(bad.sno); return; }
    setData((currentData) => ({ ...currentData, [notificationId]: currentData[notificationId].map((row) => Object.hasOwn(drafts, row.sno) ? { ...row, qty: Number(drafts[row.sno]) } : row) }));
    setDrafts({}); setEditingRows([]); setErrorRow(null); notify('All quantity changes saved');
  };
  const cancelRow = (row) => { setDrafts((currentDrafts) => { const next = { ...currentDrafts }; delete next[row.sno]; return next; }); setEditingRows((currentRows) => currentRows.filter((sno) => sno !== row.sno)); setErrorRow(null); };

  return <section className="management-panel animate-panel" aria-labelledby="quantity-title">
    <PanelHeading id="quantity-title" icon={<Boxes size={19} />} title="Offered quantity management" description="Auction quantities by mine and notification" />
    <div className="notification-toolbar">
      <label className="notification-select"><span>Select auction notification</span><div className="notification-select-wrap"><FileText size={16} /><select value={notificationId} onChange={(event) => { setNotificationId(event.target.value); setEditingRows([]); setDrafts({}); setErrorRow(null); }}>{notifications.map((item) => <option key={item.id} value={item.id}>{item.number} · {item.date}</option>)}</select><ChevronDown size={15} /></div></label>
      {current && <div className="notification-summary"><span className="notification-summary-icon"><BriefcaseBusiness size={17} /></span><div><small>SELECTED NOTIFICATION</small><b>{current.number}</b></div><i /><div><small>DATE</small><b>{current.date}</b></div><i /><div><small>SUPPLIER</small><b>{current.supplier}</b></div></div>}
    </div>
    <TableMeta count={rows.length} label="mine allocations" />
    <div className="table-scroll"><table className="data-table quantity-table"><thead><tr><th className="number-col">S.No</th><th>Mine name</th><th>Coal type</th><th>Grade</th><th className="quantity-heading">Offered quantity <small>(MT)</small></th><th className="actions-col">Actions</th></tr></thead><tbody>
      {rows.map((row) => <tr key={`${notificationId}-${row.sno}`} className={editingRows.includes(row.sno) ? 'editing-row' : ''}>
        <td className="number-cell">{String(row.sno).padStart(2, '0')}</td><td><span className="mine-name">{row.mine}</span></td><td><span className="coal-type">{row.coalType}</span></td><td><span className="grade-tag">{row.grade}</span></td>
        <td className="quantity-cell">{editingRows.includes(row.sno) ? <div className="quantity-editor"><input type="number" min="1" step="1" className={`table-input quantity-input${errorRow === row.sno ? ' input-error' : ''}`} value={drafts[row.sno] ?? String(row.qty)} onChange={(event) => { setDrafts({ ...drafts, [row.sno]: event.target.value }); setErrorRow(null); }} aria-label={`Offered quantity for ${row.mine}`} aria-invalid={errorRow === row.sno} />{errorRow === row.sno && <small className="quantity-error">Enter a positive whole number.</small>}</div> : numberFormat.format(row.qty)}</td>
        <td><div className="row-actions">{editingRows.includes(row.sno) ? <><button className="icon-button save-icon" type="button" onClick={() => saveRow(row)} aria-label={`Save quantity for ${row.mine}`} title="Save"><Check size={16} /></button><button className="icon-button cancel-icon" type="button" onClick={() => cancelRow(row)} aria-label={`Cancel editing ${row.mine}`} title="Cancel"><X size={16} /></button></> : <button className="icon-button edit-icon" type="button" onClick={() => { setEditingRows((currentRows) => currentRows.includes(row.sno) ? currentRows : [...currentRows, row.sno]); setDrafts({ ...drafts, [row.sno]: String(row.qty) }); setErrorRow(null); }} aria-label={`Edit quantity for ${row.mine}`} title="Edit quantity"><Pencil size={15} /></button>}</div></td>
      </tr>)}
      {!rows.length && <EmptyRow columns={6} message="No mine allocations are attached to this notification." />}
    </tbody><tfoot><tr><td colSpan="4"><span className="total-label">Total offered quantity</span></td><td className="total-quantity">{numberFormat.format(total)} <small>MT</small></td><td><button className="button button-primary save-all-button" type="button" onClick={saveAll} disabled={!Object.keys(drafts).length}><Check size={15} />Save all</button></td></tr></tfoot></table></div>
    <div className="quantity-footnote"><span><CircleCheck size={15} />Total updates when a quantity is saved.</span><span><i />Only positive whole numbers are accepted.</span></div>
  </section>;
}

function SelectFilter({ title, value, onChange, options, allLabel }) {
  return <label className="select-control"><span>{title}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="all">{allLabel}</option>{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select><ChevronDown size={14} /></label>;
}
function SearchField({ value, onChange, placeholder }) {
  return <label className="search-field"><Search size={16} /><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><kbd>/</kbd></label>;
}
function FormTitle({ title, subtitle, onClose }) {
  return <div className="form-heading"><div><b>{title}</b><span>{subtitle}</span></div><button className="icon-button form-close" type="button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div>;
}
function FormActions({ onCancel, submitLabel, disabled }) {
  return <div className="form-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={disabled}><Check size={15} />{submitLabel}</button></div>;
}
function TableMeta({ count, label }) {
  return <div className="table-meta"><span><b>{count}</b> {label}</span><span className="updated-label"><Activity size={13} />Live reference data</span></div>;
}
function StatusSwitch({ checked, onChange, label }) {
  return <button className={`status-switch${checked ? ' checked' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}
function EmptyRow({ columns, message }) {
  return <tr><td colSpan={columns} className="empty-state"><Search size={17} />{message}</td></tr>;
}
function Toast({ message, tone, onDismiss }) {
  return <div className={`toast toast-${tone}`} role="status" aria-live="polite"><span>{tone === 'success' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}</span>{message}<button type="button" aria-label="Dismiss notification" onClick={onDismiss}><X size={15} /></button></div>;
}
function AccessNotice({ onReturn }) {
  return <main className="access-notice"><span className="access-icon"><ShieldCheck size={24} /></span><div className="eyebrow"><i /> RESTRICTED WORKSPACE</div><h1>Procurement access required</h1><p>Master data is available to users with the Procurement role.</p><button className="button button-primary" type="button" onClick={onReturn}><ArrowLeft size={16} />Return to Procurement workspace</button></main>;
}

export default App;