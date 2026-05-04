// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const initialTasks = [
  {
    id: 1,
    title: "介绍一位有房贷的客户",
    merchant: "ProblemGo Official",
    type: "金融任务",
    reward: 20,
    bonus: 150,
    location: "Johor / Kluang",
    deadline: "3天内",
    status: "可接单",
    desc: "介绍一位真实拥有房贷，并愿意接听顾问电话了解房贷省息方案的人。",
    requirement: ["客户真实有房贷", "留下姓名与电话", "愿意接听顾问电话", "资料重复或虚假不计算"],
    rating: 4.9,
    slots: 20,
  },
  {
    id: 2,
    title: "帮我约一位客户了解Refinance",
    merchant: "Bryan Finance Advisory",
    type: "预约任务",
    reward: 30,
    bonus: 200,
    location: "Malaysia",
    deadline: "5天内",
    status: "可接单",
    desc: "帮忙预约一位想了解房贷省息或房贷重组的屋主。只要成功预约并愿意接听电话，就可审核。",
    requirement: ["对方有房贷", "已同意被联系", "成功预约线上/线下咨询", "必须填写备注"],
    rating: 4.8,
    slots: 15,
  },
  {
    id: 3,
    title: "邀请朋友了解遗嘱规划",
    merchant: "Legacy Planning Partner",
    type: "介绍任务",
    reward: 15,
    bonus: 80,
    location: "Malaysia",
    deadline: "5天内",
    status: "可接单",
    desc: "邀请一位有家庭责任的人了解基础遗嘱规划。完成有效预约后获得佣金。",
    requirement: ["对方年龄25岁以上", "已同意被联系", "成功预约线上/线下咨询", "资料真实"],
    rating: 4.8,
    slots: 30,
  },
  {
    id: 4,
    title: "帮美容院收集课程咨询名单",
    merchant: "Beauty Academy JB",
    type: "推广任务",
    reward: 10,
    bonus: 100,
    location: "Johor Bahru",
    deadline: "7天内",
    status: "可接单",
    desc: "寻找对美容课程有兴趣的女生，留下资料并确认愿意了解课程。",
    requirement: ["年龄18岁以上", "对美容课程有兴趣", "资料真实", "商家确认有效后付款"],
    rating: 4.7,
    slots: 50,
  },
];

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_READY) throw new Error("Supabase environment variables missing");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase error ${response.status}`);
  }
  if (response.status === 204) return [];
  return response.json();
}

async function fetchSubmissionsFromDatabase() {
  const rows = await supabaseRequest("submissions?select=*&order=created_at.desc");
  return rows.map((row) => ({
    id: row.id,
    user: row.user_name || "Guest User",
    phone: row.user_phone || "",
    task: row.task_title || "未知任务",
    customerName: row.customer_name || "",
    customerPhone: row.customer_phone || "",
    note: row.note || "",
    amount: Number(row.amount || 0),
    status: row.status || "待审核",
    submitted: row.created_at ? new Date(row.created_at).toLocaleString("zh-MY") : "",
  }));
}

async function insertSubmissionToDatabase(item) {
  const payload = {
    user_name: item.user,
    user_phone: item.phone,
    task_title: item.task,
    customer_name: item.customerName,
    customer_phone: item.customerPhone,
    note: item.note,
    amount: item.amount,
    status: item.status,
  };
  const rows = await supabaseRequest("submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return rows?.[0];
}

async function updateSubmissionStatusInDatabase(id, status) {
  await supabaseRequest(`submissions?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

async function deleteAllSubmissionsInDatabase() {
  await supabaseRequest("submissions?id=gt.0", { method: "DELETE" });
}

function loadLocalSubmissions() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("problemgo_submissions");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem("problemgo_submissions", JSON.stringify(items));
  }
}

function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) {
  const base = "inline-flex items-center justify-center font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "secondary"
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : variant === "outline"
      ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
      : variant === "ghost"
        ? "bg-transparent text-slate-600 hover:bg-slate-100"
        : "bg-blue-600 text-white hover:bg-blue-700";
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-slate-100 shadow-sm ${className}`}>{children}</div>;
}

function Icon({ children, className = "", size = "text-base" }) {
  return <span className={`inline-flex items-center justify-center ${size} ${className}`} aria-hidden="true">{children}</span>;
}

function Badge({ children, tone = "blue" }) {
  const map = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[tone]}`}>{children}</span>;
}

function Header({ setPage, currentUser }) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <button className="text-left" onClick={() => setPage("home")}>
          <div className="text-xl font-black tracking-tight text-slate-900">Problem <span className="text-blue-600">➜ Go</span></div>
          <div className="text-xs text-slate-500">让问题，变成收入机会</div>
        </button>
        {currentUser ? (
          <Button className="rounded-full px-4 py-2 text-sm" onClick={() => setPage("post")}>发布任务</Button>
        ) : (
          <Button className="rounded-full px-4 py-2 text-sm" onClick={() => setPage("login")}>登入</Button>
        )}
      </div>
    </div>
  );
}

function BottomNav({ page, setPage }) {
  const items = [
    { key: "home", label: "首页", icon: "⌂" },
    { key: "tasks", label: "任务", icon: "☑" },
    { key: "wallet", label: "钱包", icon: "💰" },
    { key: "admin", label: "后台", icon: "📊" },
    { key: "profile", label: "我的", icon: "人" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30">
      <div className="max-w-md mx-auto grid grid-cols-5 px-2 py-2">
        {items.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setPage(key)} className={`flex flex-col items-center gap-1 text-xs ${page === key ? "text-blue-600" : "text-slate-400"}`}>
            <Icon size="text-lg">{icon}</Icon>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <div>
            <div className="flex gap-2 items-center mb-2">
              <Badge>{task.type}</Badge>
              <Badge tone="green">{task.status}</Badge>
            </div>
            <h3 className="font-bold text-slate-900 leading-snug">{task.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{task.merchant}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-slate-900">RM{task.reward}</div>
            <div className="text-xs text-slate-500">+ Bonus RM{task.bonus}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-4">
          <span className="flex items-center gap-1"><Icon>📍</Icon>{task.location}</span>
          <span className="flex items-center gap-1"><Icon>⏱</Icon>{task.deadline}</span>
          <span className="flex items-center gap-1"><Icon>👥</Icon>{task.slots}名额</span>
        </div>
        <Button className="w-full mt-4 rounded-xl py-3" onClick={onClick}>查看任务 <span className="ml-1">→</span></Button>
      </div>
    </Card>
  );
}

function LoginPage({ setPage, setCurrentUser }) {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("Bryan Gan");
  const [phone, setPhone] = useState("012-345 6789");

  function login() {
    const user = { name, phone, role: role === "merchant" ? "商家" : "用户" };
    setCurrentUser(user);
    if (typeof window !== "undefined") localStorage.setItem("problemgo_user", JSON.stringify(user));
    setPage("home");
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-5">
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-slate-900 text-white p-6 shadow-lg">
        <div className="text-sm opacity-80">Welcome to</div>
        <div className="text-4xl font-black mt-1">Problem ➜ Go</div>
        <p className="text-sm opacity-80 mt-3">商家发布任务，用户完成任务赚佣金。</p>
      </div>
      <Card className="rounded-3xl mt-5">
        <div className="p-5 space-y-4">
          <h1 className="text-2xl font-black">注册 / 登入</h1>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setRole("user")} className={`py-3 rounded-xl text-sm font-bold ${role === "user" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>我要接任务</button>
            <button onClick={() => setRole("merchant")} className={`py-3 rounded-xl text-sm font-bold ${role === "merchant" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>我是商家</button>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名 / 商家名称" className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-4 outline-none text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号码" className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-4 outline-none text-sm" />
          <Button className="w-full rounded-2xl h-12" onClick={login}>进入 ProblemGo</Button>
          <p className="text-xs text-slate-400 leading-relaxed">Beta说明：现在会先用简单登入体验，下一阶段可升级 OTP / Email Auth。</p>
        </div>
      </Card>
    </main>
  );
}

function HomePage({ setSelectedTask, setPage, currentUser, dbStatus }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-slate-900 text-white p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-8 bottom-5 w-16 h-16 rounded-full bg-blue-400/20" />
        <div className="text-sm opacity-80">ProblemGo Beta</div>
        <div className="text-3xl font-black mt-1">每天用手机赚 RM10 – RM100</div>
        <p className="text-sm opacity-80 mt-2">帮商家解决问题，就能拿佣金。先从介绍、预约、推广开始。</p>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" className="rounded-xl px-4 py-3 text-sm" onClick={() => setPage(currentUser ? "tasks" : "login")}>开始接任务</Button>
          <Button variant="ghost" className="rounded-xl px-4 py-3 text-sm text-white hover:bg-white/10" onClick={() => setPage("how")}>如何运作</Button>
        </div>
      </div>

      <div className="mt-3">
        <Badge tone={dbStatus === "connected" ? "green" : dbStatus === "error" ? "red" : "yellow"}>
          {dbStatus === "connected" ? "Database Connected" : dbStatus === "error" ? "Database Error" : "Database Checking"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "任务", value: initialTasks.length, icon: "☑" },
          { label: "佣金", value: "RM20+", icon: "💰" },
          { label: "模式", value: "Beta", icon: "🚀" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm">
            <div>{item.icon}</div>
            <div className="font-black text-lg">{item.value}</div>
            <div className="text-xs text-slate-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-3">
        <Icon className="text-slate-400">🔍</Icon>
        <input placeholder="搜索任务，例如：房贷、推广、跑腿" className="bg-transparent outline-none flex-1 text-sm" />
      </div>

      <div className="flex justify-between items-center mt-6 mb-3">
        <h2 className="font-black text-lg">推荐任务</h2>
        <button className="text-sm text-blue-600" onClick={() => setPage("tasks")}>查看全部</button>
      </div>
      <div className="space-y-3">
        {initialTasks.slice(0, 3).map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => { setSelectedTask(task); setPage("detail"); }} />
        ))}
      </div>
    </main>
  );
}

function HowPage({ setPage }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">ProblemGo 如何运作？</h1>
      <div className="space-y-3 mt-5">
        {[
          ["1", "商家发布问题", "把需要解决的问题变成清楚任务。"],
          ["2", "用户接任务", "选择适合自己的任务，按条件完成。"],
          ["3", "提交证明", "上传资料、客户信息、截图或备注。"],
          ["4", "商家审核", "有效资料通过后，佣金进入钱包记录。"],
        ].map(([no, title, desc]) => (
          <Card key={no} className="rounded-2xl"><div className="p-4 flex gap-3"><div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">{no}</div><div><div className="font-black">{title}</div><div className="text-sm text-slate-500 mt-1">{desc}</div></div></div></Card>
        ))}
      </div>
      <Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("tasks")}>查看任务</Button>
    </main>
  );
}

function TasksPage({ setSelectedTask, setPage }) {
  const [filter, setFilter] = useState("全部");
  const filters = ["全部", "金融任务", "预约任务", "介绍任务", "推广任务"];
  const visible = filter === "全部" ? initialTasks : initialTasks.filter((task) => task.type === filter);
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">任务大厅</h1>
      <p className="text-sm text-slate-500 mt-1">选择你可以完成的任务，提交有效资料赚佣金。</p>
      <div className="flex gap-2 overflow-x-auto py-4">
        {filters.map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-100"}`}>{f}</button>)}
      </div>
      <div className="space-y-3">{visible.map((task) => <TaskCard key={task.id} task={task} onClick={() => { setSelectedTask(task); setPage("detail"); }} />)}</div>
    </main>
  );
}

function DetailPage({ task, setPage, currentUser }) {
  if (!task) return null;
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <Card className="rounded-3xl">
        <div className="p-5">
          <div className="flex gap-2 mb-2"><Badge>{task.type}</Badge><Badge tone="green">{task.status}</Badge></div>
          <h1 className="text-2xl font-black mt-1">{task.title}</h1>
          <div className="flex items-end gap-2 mt-4"><div className="text-4xl font-black text-slate-900">RM{task.reward}</div><div className="text-sm text-slate-500 mb-1">审核通过后</div></div>
          <div className="text-sm text-blue-600 font-semibold mt-1">成交/签署后 Bonus RM{task.bonus}</div>
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-500"><span className="flex items-center gap-1"><Icon>📍</Icon>{task.location}</span><span className="flex items-center gap-1"><Icon>⭐</Icon>{task.rating}</span><span className="flex items-center gap-1"><Icon>👥</Icon>{task.slots}名额</span></div>
        </div>
      </Card>
      <section className="mt-5"><h2 className="font-black mb-2">任务说明</h2><p className="text-sm text-slate-600 leading-relaxed bg-white rounded-2xl p-4 border border-slate-100">{task.desc}</p></section>
      <section className="mt-5"><h2 className="font-black mb-2">完成条件</h2><div className="space-y-2">{task.requirement.map((r) => <div key={r} className="flex items-center gap-2 text-sm bg-white rounded-xl p-3 border border-slate-100"><Icon className="text-blue-600">✓</Icon>{r}</div>)}</div></section>
      <Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage(currentUser ? "submit" : "login")}>我要接任务</Button>
    </main>
  );
}

function SubmitPage({ selectedTask, currentUser, setPage, submissions, setSubmissions, refreshSubmissions, setDbStatus }) {
  const [form, setForm] = useState({ customerName: "", customerPhone: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setIsSubmitting(true);
    const item = {
      id: Date.now(),
      user: currentUser?.name || "Guest User",
      phone: currentUser?.phone || "",
      task: selectedTask?.title || "未知任务",
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      note: form.note,
      amount: selectedTask?.reward || 0,
      status: "待审核",
      submitted: new Date().toLocaleString("zh-MY"),
    };
    try {
      if (SUPABASE_READY) {
        await insertSubmissionToDatabase(item);
        await refreshSubmissions();
        setDbStatus("connected");
      } else {
        const next = [item, ...submissions];
        setSubmissions(next);
        saveLocalSubmissions(next);
        setDbStatus("local");
      }
      setPage("success");
    } catch (err) {
      setDbStatus("error");
      setError(err.message || "提交失败，请检查 Supabase 表格和权限。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">提交任务证明</h1>
      <p className="text-sm text-slate-500 mt-1">任务：{selectedTask?.title}</p>
      <div className="space-y-3 mt-5">
        <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="客户姓名" className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm" />
        <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="客户电话" className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm" />
        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="备注：客户情况、地区、方便联系时间" className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm h-28" />
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-6 text-center"><div className="mx-auto text-slate-400 text-3xl">⬆</div><div className="text-sm font-semibold mt-2">上传截图 / 照片 / 文件</div><div className="text-xs text-slate-400 mt-1">下一阶段会接 Supabase Storage</div></div>
        {error && <div className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</div>}
      </div>
      <Button disabled={isSubmitting} className="w-full rounded-2xl h-12 mt-6" onClick={submit}>{isSubmitting ? "提交中..." : "提交给商家审核"}</Button>
    </main>
  );
}

function WalletPage({ submissions, currentUser }) {
  const myItems = submissions.filter((s) => !currentUser || s.user === currentUser.name || currentUser.role === "商家");
  const approved = myItems.filter((s) => s.status === "已通过").reduce((sum, s) => sum + s.amount, 0);
  const pending = myItems.filter((s) => s.status === "待审核").reduce((sum, s) => sum + s.amount, 0);
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">我的钱包</h1>
      <Card className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-700 text-white mt-4 shadow-lg"><div className="p-5"><div className="text-sm opacity-75">总收入</div><div className="text-4xl font-black mt-1">RM{approved + pending}</div><div className="grid grid-cols-2 gap-3 mt-5"><div className="bg-white/10 rounded-2xl p-3"><div className="text-xs opacity-70">可提现</div><div className="font-black text-xl">RM{approved}</div></div><div className="bg-white/10 rounded-2xl p-3"><div className="text-xs opacity-70">审核中</div><div className="font-black text-xl">RM{pending}</div></div></div><Button variant="secondary" className="w-full rounded-2xl mt-5 py-3">申请提现</Button></div></Card>
      <h2 className="font-black mt-6 mb-3">收入记录</h2>
      <div className="space-y-3">{myItems.map((s) => <div key={s.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-between gap-3"><div><div className="font-semibold text-sm">{s.task}</div><div className="text-xs text-slate-400">{s.submitted}</div><Badge tone={s.status === "已通过" ? "green" : "yellow"}>{s.status}</Badge></div><div className="font-black">RM{s.amount}</div></div>)}</div>
    </main>
  );
}

function AdminPage({ submissions, setSubmissions, refreshSubmissions, dbStatus, setDbStatus }) {
  const totalPending = submissions.filter((s) => s.status === "待审核").length;
  const totalReward = submissions.reduce((sum, s) => sum + s.amount, 0);
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(id, status) {
    try {
      if (SUPABASE_READY) {
        await updateSubmissionStatusInDatabase(id, status);
        await refreshSubmissions();
        setDbStatus("connected");
      } else {
        const next = submissions.map((s) => s.id === id ? { ...s, status } : s);
        setSubmissions(next);
        saveLocalSubmissions(next);
      }
    } catch {
      setDbStatus("error");
    }
  }

  async function manualRefresh() {
    setIsLoading(true);
    await refreshSubmissions();
    setIsLoading(false);
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-black">后台 Dashboard</h1><p className="text-sm text-slate-500 mt-1">查看提交、审核任务、看数据。</p></div><Button variant="outline" className="rounded-xl px-3 py-2 text-xs" onClick={manualRefresh}>{isLoading ? "刷新中" : "刷新"}</Button></div>
      <div className="mt-3"><Badge tone={dbStatus === "connected" ? "green" : dbStatus === "error" ? "red" : "yellow"}>{dbStatus === "connected" ? "Supabase 已连接" : dbStatus === "error" ? "Supabase 错误" : "检查连接中"}</Badge></div>
      <div className="grid grid-cols-3 gap-3 mt-4"><div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm"><div className="font-black text-xl">{submissions.length}</div><div className="text-xs text-slate-400">总提交</div></div><div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm"><div className="font-black text-xl">{totalPending}</div><div className="text-xs text-slate-400">待审核</div></div><div className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm"><div className="font-black text-xl">RM{totalReward}</div><div className="text-xs text-slate-400">佣金</div></div></div>
      <h2 className="font-black mt-6 mb-3">任务提交记录</h2>
      <div className="space-y-3">{submissions.length === 0 && <div className="text-sm text-slate-500 bg-white rounded-2xl p-5 border border-slate-100">暂时没有提交记录。</div>}{submissions.map((s) => <Card key={s.id} className="rounded-2xl"><div className="p-4"><div className="flex justify-between gap-2"><div className="font-bold">{s.task}</div><Badge tone={s.status === "已通过" ? "green" : s.status === "已拒绝" ? "red" : "yellow"}>{s.status}</Badge></div><div className="text-sm text-slate-500 mt-2">提交者：{s.user} · {s.phone}</div><div className="text-sm text-slate-500">客户：{s.customerName || "-"} · {s.customerPhone || "-"}</div><div className="text-sm text-slate-500">备注：{s.note || "-"}</div><div className="text-sm text-slate-500">佣金：RM{s.amount}</div><div className="flex gap-2 mt-4"><Button className="flex-1 rounded-xl py-3" onClick={() => updateStatus(s.id, "已通过")}>通过</Button><Button variant="outline" className="flex-1 rounded-xl py-3" onClick={() => updateStatus(s.id, "已拒绝")}>拒绝</Button></div></div></Card>)}</div>
    </main>
  );
}

function PostTaskPage({ setPage }) {
  return <main className="max-w-md mx-auto px-4 pb-24 pt-4"><h1 className="text-2xl font-black">发布任务</h1><p className="text-sm text-slate-500 mt-1">把你的问题变成一个清楚的任务。</p><div className="space-y-3 mt-5">{["任务标题", "任务说明", "佣金金额 RM", "Bonus 金额 RM", "地点", "截止时间"].map((p) => <input key={p} placeholder={p} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm" />)}<textarea placeholder="完成条件，例如：客户必须真实有房贷、愿意接电话、资料不可重复" className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm h-28" /></div><Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("admin")}><span className="mr-1">＋</span>发布任务 Demo</Button></main>;
}

function ProfilePage({ currentUser, setCurrentUser, setPage }) {
  function logout() { setCurrentUser(null); if (typeof window !== "undefined") localStorage.removeItem("problemgo_user"); setPage("home"); }
  if (!currentUser) return <main className="max-w-md mx-auto px-4 pb-24 pt-8 text-center"><div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-2xl font-black text-blue-600">PG</div><h1 className="text-2xl font-black mt-4">还没登入</h1><p className="text-sm text-slate-500 mt-2">登入后可以接任务、提交资料和查看钱包。</p><Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("login")}>登入 / 注册</Button></main>;
  return <main className="max-w-md mx-auto px-4 pb-24 pt-4"><div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center"><div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-2xl font-black text-blue-600">PG</div><h1 className="text-xl font-black mt-3">{currentUser.name}</h1><p className="text-sm text-slate-500">身份：{currentUser.role} · {currentUser.phone}</p><div className="grid grid-cols-3 gap-3 mt-5"><div><div className="font-black text-xl">12</div><div className="text-xs text-slate-400">完成</div></div><div><div className="font-black text-xl">4.8</div><div className="text-xs text-slate-400">评分</div></div><div><div className="font-black text-xl">92%</div><div className="text-xs text-slate-400">通过率</div></div></div></div><div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4"><div className="font-bold mb-2">系统状态</div><div className="text-sm text-slate-500 leading-relaxed">当前版本已支持 Supabase 数据提交和后台读取。下一阶段可升级正式会员系统、商家任务发布和权限管理。</div></div><Button variant="outline" className="w-full rounded-2xl h-12 mt-4" onClick={logout}>登出</Button></main>;
}

function SuccessPage({ setPage }) {
  return <main className="max-w-md mx-auto px-4 pb-24 pt-12 text-center"><div className="mx-auto text-blue-600 text-6xl">✓</div><h1 className="text-2xl font-black mt-4">提交成功</h1><p className="text-sm text-slate-500 mt-2">资料已提交，商家审核通过后，佣金会进入钱包记录。</p><Button className="w-full rounded-2xl h-12 mt-8" onClick={() => setPage("admin")}>去后台查看</Button></main>;
}

export default function ProblemGoApp() {
  const [page, setPage] = useState("home");
  const [selectedTask, setSelectedTask] = useState(initialTasks[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [dbStatus, setDbStatus] = useState("checking");

  async function refreshSubmissions() {
    try {
      if (SUPABASE_READY) {
        const rows = await fetchSubmissionsFromDatabase();
        setSubmissions(rows);
        setDbStatus("connected");
      } else {
        setSubmissions(loadLocalSubmissions());
        setDbStatus("local");
      }
    } catch (err) {
      console.error(err);
      setSubmissions(loadLocalSubmissions());
      setDbStatus("error");
    }
  }

  useEffect(() => {
    refreshSubmissions();
    try {
      const savedUser = localStorage.getItem("problemgo_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch {}
  }, []);

  const screen = useMemo(() => {
    switch (page) {
      case "home": return <HomePage setSelectedTask={setSelectedTask} setPage={setPage} currentUser={currentUser} dbStatus={dbStatus} />;
      case "login": return <LoginPage setPage={setPage} setCurrentUser={setCurrentUser} />;
      case "how": return <HowPage setPage={setPage} />;
      case "tasks": return <TasksPage setSelectedTask={setSelectedTask} setPage={setPage} />;
      case "detail": return <DetailPage task={selectedTask} setPage={setPage} currentUser={currentUser} />;
      case "submit": return <SubmitPage selectedTask={selectedTask} currentUser={currentUser} setPage={setPage} submissions={submissions} setSubmissions={setSubmissions} refreshSubmissions={refreshSubmissions} setDbStatus={setDbStatus} />;
      case "wallet": return <WalletPage submissions={submissions} currentUser={currentUser} />;
      case "admin": return <AdminPage submissions={submissions} setSubmissions={setSubmissions} refreshSubmissions={refreshSubmissions} dbStatus={dbStatus} setDbStatus={setDbStatus} />;
      case "post": return <PostTaskPage setPage={setPage} />;
      case "profile": return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} setPage={setPage} />;
      case "success": return <SuccessPage setPage={setPage} />;
      default: return <HomePage setSelectedTask={setSelectedTask} setPage={setPage} currentUser={currentUser} dbStatus={dbStatus} />;
    }
  }, [page, selectedTask, currentUser, submissions, dbStatus]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header setPage={setPage} currentUser={currentUser} />
      {screen}
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
