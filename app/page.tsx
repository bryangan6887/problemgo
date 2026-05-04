"use client";
// @ts-nocheck

import React, { useMemo, useState } from "react";

const tasks = [
  {
    id: 1,
    title: "介绍一位有房贷的客户",
    merchant: "Bryan Finance Advisory",
    type: "金融任务",
    reward: 20,
    bonus: 150,
    location: "Johor / Kluang",
    deadline: "3天内",
    status: "可接单",
    desc: "介绍一位真实拥有房贷，并愿意接听顾问电话了解房贷省息方案的人。",
    requirement: ["客户真实有房贷", "留下姓名与电话", "愿意接听顾问电话", "资料重复或虚假不计算"],
    rating: 4.9,
  },
  {
    id: 2,
    title: "邀请朋友了解遗嘱规划",
    merchant: "Legacy Planning Partner",
    type: "介绍任务",
    reward: 15,
    bonus: 80,
    location: "Malaysia",
    deadline: "5天内",
    status: "可接单",
    desc: "邀请一位有家庭责任的人了解基础遗嘱规划。完成有效预约后获得佣金。",
    requirement: ["对方年龄25岁以上", "已同意被联系", "成功预约线上/线下咨询", "必须填写备注"],
    rating: 4.8,
  },
  {
    id: 3,
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
  },
];

const submissions = [
  { id: 1, user: "Alex Tan", task: "介绍一位有房贷的客户", amount: 20, status: "待审核", submitted: "今天 10:30 AM" },
  { id: 2, user: "Mei Ling", task: "邀请朋友了解遗嘱规划", amount: 15, status: "已通过", submitted: "昨天 4:15 PM" },
];

const selfTests = [
  { name: "has tasks", pass: Array.isArray(tasks) && tasks.length >= 3 },
  { name: "task reward is numeric", pass: tasks.every((task) => typeof task.reward === "number") },
  { name: "submissions has required fields", pass: submissions.every((item) => item.user && item.task && typeof item.amount === "number") },
  { name: "requirements are arrays", pass: tasks.every((task) => Array.isArray(task.requirement)) },
];

function Button({ children, onClick, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center font-semibold transition active:scale-[0.98]";
  const styles = variant === "secondary"
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : variant === "outline"
      ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`bg-white border border-slate-100 shadow-sm ${className}`}>{children}</div>;
}

function Icon({ children, className = "", size = "text-base" }) {
  return <span className={`inline-flex items-center justify-center ${size} ${className}`} aria-hidden="true">{children}</span>;
}

function Header({ setPage }) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <button className="text-left" onClick={() => setPage("home")}>
          <div className="text-xl font-black tracking-tight text-slate-900">Problem <span className="text-blue-600">➜ Go</span></div>
          <div className="text-xs text-slate-500">让问题，变成收入机会</div>
        </button>
        <Button className="rounded-full px-4 py-2 text-sm" onClick={() => setPage("post")}>发布任务</Button>
      </div>
    </div>
  );
}

function BottomNav({ page, setPage }) {
  const items = [
    { key: "home", label: "首页", icon: "⌂" },
    { key: "tasks", label: "任务", icon: "☑" },
    { key: "wallet", label: "钱包", icon: "💰" },
    { key: "merchant", label: "商家", icon: "店" },
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
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Card className="rounded-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between gap-3">
            <div>
              <div className="text-xs text-blue-600 font-semibold mb-1">{task.type}</div>
              <h3 className="font-bold text-slate-900 leading-snug">{task.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{task.merchant}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-slate-900">RM{task.reward}</div>
              <div className="text-xs text-slate-500">+ Bonus RM{task.bonus}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-4">
            <span className="flex items-center gap-1"><Icon>📍</Icon>{task.location}</span>
            <span className="flex items-center gap-1"><Icon>⏱</Icon>{task.deadline}</span>
          </div>
          <Button className="w-full mt-4 rounded-xl py-3" onClick={onClick}>查看任务 <span className="ml-1">→</span></Button>
        </div>
      </Card>
    </div>
  );
}

function HomePage({ setSelectedTask, setPage }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-slate-900 text-white p-5 shadow-lg">
        <div className="text-sm opacity-80">今天可以开始的任务</div>
        <div className="text-3xl font-black mt-1">赚取额外收入</div>
        <p className="text-sm opacity-80 mt-2">接任务、提交证明、审核通过后获得佣金。</p>
      </div>

      <div className="mt-4 flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-3">
        <Icon className="text-slate-400">🔍</Icon>
        <input placeholder="搜索任务，例如：房贷、推广、跑腿" className="bg-transparent outline-none flex-1 text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "高佣金", icon: "🔥" },
          { label: "附近", icon: "📍" },
          { label: "最新", icon: "🆕" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm font-semibold text-sm">
            <div>{item.icon}</div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 mb-3">
        <h2 className="font-black text-lg">推荐任务</h2>
        <button className="text-sm text-blue-600" onClick={() => setPage("tasks")}>查看全部</button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => { setSelectedTask(task); setPage("detail"); }} />
        ))}
      </div>
    </main>
  );
}

function DetailPage({ task, setPage }) {
  if (!task) return null;
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <Card className="rounded-3xl">
        <div className="p-5">
          <div className="text-xs text-blue-600 font-semibold">{task.type}</div>
          <h1 className="text-2xl font-black mt-1">{task.title}</h1>
          <div className="flex items-end gap-2 mt-4">
            <div className="text-4xl font-black text-slate-900">RM{task.reward}</div>
            <div className="text-sm text-slate-500 mb-1">审核通过后</div>
          </div>
          <div className="text-sm text-blue-600 font-semibold mt-1">成交/签署后 Bonus RM{task.bonus}</div>
          <div className="flex gap-3 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Icon>📍</Icon>{task.location}</span>
            <span className="flex items-center gap-1"><Icon>⭐</Icon>{task.rating}</span>
          </div>
        </div>
      </Card>

      <section className="mt-5">
        <h2 className="font-black mb-2">任务说明</h2>
        <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-2xl p-4 border border-slate-100">{task.desc}</p>
      </section>

      <section className="mt-5">
        <h2 className="font-black mb-2">完成条件</h2>
        <div className="space-y-2">
          {task.requirement.map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm bg-white rounded-xl p-3 border border-slate-100">
              <Icon className="text-blue-600">✓</Icon>{r}
            </div>
          ))}
        </div>
      </section>

      <Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("submit")}>我要接任务</Button>
    </main>
  );
}

function SubmitPage({ setPage }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">提交任务证明</h1>
      <p className="text-sm text-slate-500 mt-1">提交后商家将在指定时间内审核。</p>
      <div className="space-y-3 mt-5">
        {["客户姓名", "客户电话", "房屋地区 / 备注"].map((p) => (
          <input key={p} placeholder={p} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm" />
        ))}
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-6 text-center">
          <div className="mx-auto text-slate-400 text-3xl">⬆</div>
          <div className="text-sm font-semibold mt-2">上传截图 / 照片 / 文件</div>
          <div className="text-xs text-slate-400 mt-1">PNG, JPG, PDF</div>
        </div>
      </div>
      <Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("success")}>提交给商家审核</Button>
    </main>
  );
}

function WalletPage() {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">我的钱包</h1>
      <Card className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-700 text-white mt-4 shadow-lg">
        <div className="p-5">
          <div className="text-sm opacity-75">总收入</div>
          <div className="text-4xl font-black mt-1">RM1,250</div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/10 rounded-2xl p-3"><div className="text-xs opacity-70">可提现</div><div className="font-black text-xl">RM800</div></div>
            <div className="bg-white/10 rounded-2xl p-3"><div className="text-xs opacity-70">审核中</div><div className="font-black text-xl">RM450</div></div>
          </div>
          <Button variant="secondary" className="w-full rounded-2xl mt-5 py-3">申请提现</Button>
        </div>
      </Card>
      <h2 className="font-black mt-6 mb-3">收入记录</h2>
      <div className="space-y-3">
        {submissions.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-between">
            <div><div className="font-semibold text-sm">{s.task}</div><div className="text-xs text-slate-400">{s.submitted}</div></div>
            <div className="font-black">RM{s.amount}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

function MerchantPage() {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">商家中心</h1>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {["进行中 8", "待审核 2", "已完成 21"].map((x) => (
          <div key={x} className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm font-bold text-sm">{x}</div>
        ))}
      </div>
      <h2 className="font-black mt-6 mb-3">待审核提交</h2>
      <div className="space-y-3">
        {submissions.map((s) => (
          <Card key={s.id} className="rounded-2xl">
            <div className="p-4">
              <div className="font-bold">{s.task}</div>
              <div className="text-sm text-slate-500 mt-1">提交者：{s.user}</div>
              <div className="text-sm text-slate-500">佣金：RM{s.amount}</div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 rounded-xl py-3"><span className="mr-1">✓</span>通过</Button>
                <Button variant="outline" className="flex-1 rounded-xl py-3">拒绝</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}

function PostTaskPage({ setPage }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <h1 className="text-2xl font-black">发布任务</h1>
      <p className="text-sm text-slate-500 mt-1">把你的问题变成一个清楚的任务。</p>
      <div className="space-y-3 mt-5">
        {["任务标题", "任务说明", "佣金金额 RM", "Bonus 金额 RM", "地点", "截止时间"].map((p) => (
          <input key={p} placeholder={p} className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm" />
        ))}
        <textarea placeholder="完成条件，例如：客户必须真实有房贷、愿意接电话、资料不可重复" className="w-full rounded-2xl bg-white border border-slate-100 px-4 py-4 outline-none text-sm h-28" />
      </div>
      <Button className="w-full rounded-2xl h-12 mt-6" onClick={() => setPage("merchant")}><span className="mr-1">＋</span>发布任务</Button>
    </main>
  );
}

function ProfilePage() {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-2xl font-black text-blue-600">PG</div>
        <h1 className="text-xl font-black mt-3">ProblemGo User</h1>
        <p className="text-sm text-slate-500">信用等级：新手执行者</p>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div><div className="font-black text-xl">12</div><div className="text-xs text-slate-400">完成</div></div>
          <div><div className="font-black text-xl">4.8</div><div className="text-xs text-slate-400">评分</div></div>
          <div><div className="font-black text-xl">92%</div><div className="text-xs text-slate-400">通过率</div></div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4">
        <div className="font-bold mb-2">Prototype Self Tests</div>
        <div className="space-y-2">
          {selfTests.map((test) => (
            <div key={test.name} className="flex justify-between text-sm">
              <span>{test.name}</span>
              <span className={test.pass ? "text-green-600" : "text-red-600"}>{test.pass ? "PASS" : "FAIL"}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SuccessPage({ setPage }) {
  return (
    <main className="max-w-md mx-auto px-4 pb-24 pt-12 text-center">
      <div className="mx-auto text-blue-600 text-6xl">✓</div>
      <h1 className="text-2xl font-black mt-4">提交成功</h1>
      <p className="text-sm text-slate-500 mt-2">商家审核通过后，佣金会进入你的钱包。</p>
      <Button className="w-full rounded-2xl h-12 mt-8" onClick={() => setPage("wallet")}>查看钱包</Button>
    </main>
  );
}

export default function ProblemGoApp() {
  const [page, setPage] = useState("home");
  const [selectedTask, setSelectedTask] = useState(tasks[0]);

  const screen = useMemo(() => {
    switch (page) {
      case "home": return <HomePage setSelectedTask={setSelectedTask} setPage={setPage} />;
      case "tasks": return <HomePage setSelectedTask={setSelectedTask} setPage={setPage} />;
      case "detail": return <DetailPage task={selectedTask} setPage={setPage} />;
      case "submit": return <SubmitPage setPage={setPage} />;
      case "wallet": return <WalletPage />;
      case "merchant": return <MerchantPage />;
      case "post": return <PostTaskPage setPage={setPage} />;
      case "profile": return <ProfilePage />;
      case "success": return <SuccessPage setPage={setPage} />;
      default: return <HomePage setSelectedTask={setSelectedTask} setPage={setPage} />;
    }
  }, [page, selectedTask]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <Header setPage={setPage} />
      {screen}
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

