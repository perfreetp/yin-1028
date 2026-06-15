import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Gauge,
  Droplets,
  FileText,
  Bell,
  BarChart3,
  Leaf,
} from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { path: '/', label: '园区总览', icon: LayoutDashboard },
  { path: '/plots', label: '地块管理', icon: MapPin },
  { path: '/sensors', label: '传感器监测', icon: Gauge },
  { path: '/plans', label: '水肥计划', icon: Droplets },
  { path: '/records', label: '执行记录', icon: FileText },
  { path: '/alerts', label: '告警管理', icon: Bell },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-primary-800 text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-xl">
      <div className="p-5 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide">果园管理</h1>
            <p className="text-xs text-primary-300">水肥一体化平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-primary-200 hover:bg-primary-700/50 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="bg-primary-900/50 rounded-xl p-4">
          <p className="text-xs text-primary-300 mb-2">系统提示</p>
          <p className="text-sm text-white">当前有 <span className="text-warning-400 font-bold">4</span> 条告警待处理</p>
        </div>
      </div>
    </aside>
  );
}
