import React from 'react';
import { 
  Users, BookOpen, BarChart3, TrendingUp, Calendar, 
  CheckCircle2, Clock, MoreHorizontal, Plus, ChevronRight
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-10">
      
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-display font-bold text-secondary">Class Overview</h2>
           <p className="text-slate-500 mt-1">Physics 101 • Fall Semester</p>
        </div>
        <button className="bg-brand text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 flex items-center gap-2">
           <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-secondary/5 shadow-soft hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
               <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Students</p>
            <h3 className="text-3xl font-display font-bold text-secondary mt-1">124</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-secondary/5 shadow-soft hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
               <TrendingUp className="w-3 h-3" /> +5%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Avg. Score</p>
            <h3 className="text-3xl font-display font-bold text-secondary mt-1">84%</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-secondary/5 shadow-soft hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
             <span className="text-xs font-bold text-slate-500 bg-base px-2 py-1 rounded-md flex items-center gap-1">
               <Clock className="w-3 h-3" /> 2 Active
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Assignments</p>
            <h3 className="text-3xl font-display font-bold text-secondary mt-1">8</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-secondary/5 shadow-soft hover:-translate-y-1 transition-transform duration-300">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-base px-2 py-1 rounded-md">
               Latest Quiz
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Completion</p>
            <h3 className="text-3xl font-display font-bold text-secondary mt-1">92%</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Class List */}
        <div className="lg:col-span-2 bg-surface border border-secondary/5 rounded-3xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-secondary">Student Performance</h3>
            <button className="text-sm font-bold text-accent hover:text-accent-hover transition-all duration-300 hover:-translate-y-0.5">
              View All Students
            </button>
          </div>
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-base text-xs uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-5">Student</th>
                <th className="px-6 py-5">Weakest Topic</th>
                <th className="px-6 py-5">Last Quiz</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                { name: "Alex Chen", topic: "Thermodynamics", score: "78%", img: "AC" },
                { name: "Sarah Miller", topic: "Kinematics", score: "92%", img: "SM" },
                { name: "James Wilson", topic: "Fluid Dynamics", score: "65%", img: "JW" },
                { name: "Emily Zhang", topic: "Forces", score: "88%", img: "EZ" },
              ].map((student, i) => (
                <tr key={i} className="hover:bg-base/50 transition-colors group">
                  <td className="px-6 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      {student.img}
                    </div>
                    <span className="font-bold text-secondary text-base">{student.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                      {student.topic}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-secondary">{student.score}</td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-secondary transition-all duration-300 hover:scale-110 active:scale-95">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions / Assignments */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand to-[#1a2342] rounded-3xl p-8 text-white shadow-lg shadow-brand/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
             <h3 className="text-xl font-display font-bold mb-2 relative z-10">AI Lesson Planner</h3>
             <p className="text-blue-50 text-sm mb-6 relative z-10 leading-relaxed">Generate next week's lesson plan tailored to the class's weak areas in Thermodynamics.</p>
             <button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 backdrop-blur-sm relative z-10">
               <Plus className="w-4 h-4" /> Create Plan
             </button>
          </div>

          <div className="bg-surface border border-secondary/5 rounded-3xl p-8 shadow-soft">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-display font-bold text-secondary text-lg">Upcoming Tasks</h3>
               <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {[
                { title: "Mid-Term Prep", due: "Tomorrow", color: "bg-orange-400" },
                { title: "Lab Report 3", due: "Fri, Oct 24", color: "bg-accent" },
                { title: "Vectors Quiz", due: "Mon, Oct 27", color: "bg-emerald-400" },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-base hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                  <div className={`w-3 h-3 rounded-full ${task.color} shrink-0 shadow-sm`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-secondary group-hover:text-accent transition-colors">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Due: {task.due}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;