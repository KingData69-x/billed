"use client";
import { useEffect, useRef, useState } from "react";
import { DollarSign, Clock, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (target === 0) { setValue(0); return; }

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

interface StatCardProps {
  label: string;
  rawValue: number;
  sub: string;
  isCurrency: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  glowRgb: string;
  delay: number;
}

function StatCard({ label, rawValue, sub, isCurrency, icon: Icon, iconColor, iconBg, borderColor, glowRgb, delay }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  const counted = useCountUp(isCurrency ? rawValue * 100 : rawValue, 1100);
  const display = isCurrency
    ? `$${(counted / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : String(Math.round(counted));

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient-border wrapper (p-px trick) */}
      <div
        className="p-px rounded-2xl transition-all duration-300"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${borderColor} 0%, rgba(255,255,255,0.05) 60%, transparent 100%)`
            : "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
          boxShadow: hovered ? `0 12px 48px rgba(${glowRgb},0.14)` : "none",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
        }}
      >
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "#0b0b14" }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              background: `radial-gradient(ellipse at top left, rgba(${glowRgb},0.1), transparent 65%)`,
              opacity: hovered ? 1 : 0,
            }}
          />

          <div className="relative">
            {/* Icon + sub-label row */}
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: iconBg }}
              >
                <Icon className={iconColor} style={{ width: 18, height: 18 }} />
              </div>
              <span
                className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-full"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {sub}
              </span>
            </div>

            {/* Value */}
            <p
              className="text-[28px] font-bold leading-none tabular-nums tracking-tight"
              style={{ color: "#fff" }}
            >
              {display}
            </p>
            <p className="text-xs font-medium mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              {label}
            </p>

            {/* Bottom accent line */}
            <div
              className="mt-4 h-px rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${borderColor}, transparent)`,
                opacity: hovered ? 0.6 : 0.2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface StatsGridProps {
  totalEarned: number;
  outstanding: number;
  monthlyRevenue: number;
  clientCount: number;
  monthlyInvoiceCount: number;
  totalInvoiceCount: number;
}

export function StatsGrid({ totalEarned, outstanding, monthlyRevenue, clientCount, monthlyInvoiceCount, totalInvoiceCount }: StatsGridProps) {
  const cards = [
    {
      label: "Total Earned",
      rawValue: totalEarned,
      sub: "All time",
      isCurrency: true,
      icon: DollarSign,
      iconColor: "text-emerald-400",
      iconBg: "rgba(16,185,129,0.12)",
      borderColor: "rgba(16,185,129,0.5)",
      glowRgb: "16,185,129",
      delay: 100,
    },
    {
      label: "Outstanding",
      rawValue: outstanding,
      sub: "Awaiting payment",
      isCurrency: true,
      icon: Clock,
      iconColor: "text-blue-400",
      iconBg: "rgba(59,130,246,0.12)",
      borderColor: "rgba(59,130,246,0.5)",
      glowRgb: "59,130,246",
      delay: 175,
    },
    {
      label: "This Month",
      rawValue: monthlyRevenue,
      sub: `${monthlyInvoiceCount} invoice${monthlyInvoiceCount !== 1 ? "s" : ""}`,
      isCurrency: true,
      icon: TrendingUp,
      iconColor: "text-orange-400",
      iconBg: "rgba(249,115,22,0.12)",
      borderColor: "rgba(249,115,22,0.5)",
      glowRgb: "249,115,22",
      delay: 250,
    },
    {
      label: "Clients",
      rawValue: clientCount,
      sub: `${totalInvoiceCount} invoice${totalInvoiceCount !== 1 ? "s" : ""} total`,
      isCurrency: false,
      icon: Users,
      iconColor: "text-purple-400",
      iconBg: "rgba(168,85,247,0.12)",
      borderColor: "rgba(168,85,247,0.5)",
      glowRgb: "168,85,247",
      delay: 325,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}
