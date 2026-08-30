import React from "react";
import Navbar from "../components/navbar.jsx";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description:
        "Manage employee profiles, departments, roles, managers, and employment information from one centralized system.",
    },
    {
      icon: Target,
      title: "Goals & KPIs",
      description:
        "Set measurable goals and KPIs, assign targets, monitor progress, and track completion.",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Understand employee and department performance with charts, trends, and detailed analytics.",
    },
    {
      icon: ClipboardCheck,
      title: "Performance Reviews",
      description:
        "Conduct structured performance reviews with ratings, comments, self-evaluations, and manager feedback.",
    },
    {
      icon: MessageSquareText,
      title: "Feedback System",
      description:
        "Create continuous feedback between managers and employees to encourage growth and improvement.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Security",
      description:
        "Protect organizational data using secure authentication and role-based access control.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Add Your Team",
      description:
        "Create employee profiles and organize your workforce by departments and managers.",
    },
    {
      number: "02",
      icon: Target,
      title: "Set Goals & KPIs",
      description:
        "Assign measurable goals, tasks, and KPIs that align employees with organizational objectives.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Track Progress",
      description:
        "Monitor goals, tasks, KPIs, and employee performance throughout the review period.",
    },
    {
      number: "04",
      icon: Award,
      title: "Review & Improve",
      description:
        "Conduct reviews, provide feedback, analyze results, and identify opportunities for growth.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-30 pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Turn Employee
                <span className="block text-blue-400">Performance</span>
                Into Progress.
              </h1>

              <p className="mt-6 text-lg text-slate-400 leading-8 max-w-xl">
                A complete platform to manage employees, set goals, track
                KPIs, conduct performance reviews, and turn workforce data
                into meaningful insights.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
                >
                  Start Tracking Performance
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold transition"
                >
                  Explore How It Works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-400" />
                  Goal Tracking
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-400" />
                  KPI Analytics
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-400" />
                  Performance Reviews
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                <img
                  src="/dashboard-preview.png"
                  alt="Employee Performance Tracker Dashboard"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
              Powerful Features
            </span>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Everything you need to manage performance
            </h2>

            <p className="mt-5 text-slate-400 leading-7">
              Manage employees, goals, KPIs, reviews, and feedback from one
              centralized performance management platform.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="group p-7 rounded-2xl border border-white/10 bg-white/[0.025] hover:bg-white/[0.05] hover:border-blue-500/30 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-400 leading-6">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
              Simple Workflow
            </span>

            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              How PerformanceTrack works
            </h2>

            <p className="mt-5 text-slate-400">
              A simple process that connects goals, performance, feedback,
              and growth.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={index} className="relative">
                  <div className="p-7 rounded-2xl border border-white/10 bg-white/[0.025] h-full">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Icon size={22} />
                      </div>

                      <span className="text-3xl font-bold text-white/10">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-7 text-lg font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm text-slate-400 leading-6">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <ArrowRight
                      className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-700"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <blockquote className="text-2xl sm:text-3xl font-semibold leading-relaxed">
            "Performance management became much easier once our team had one
            place for goals, KPIs, reviews, and feedback."
          </blockquote>

          <div className="mt-7">
            <p className="font-semibold">Sarah Johnson</p>

            <p className="text-sm text-slate-500 mt-1">HR Manager</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8">
        <p className="text-sm text-slate-500 text-center">
          © 2026 PerformanceTrack. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;


