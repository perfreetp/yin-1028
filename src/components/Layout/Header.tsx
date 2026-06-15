import { useState } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

export default function Header() {
  const { currentUser, alerts, setCurrentUser, users } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unhandledAlerts = alerts.filter((a) => a.status !== 'resolved').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索地块、设备、计划..."
            className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          title="刷新数据"
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors',
              isRefreshing && 'animate-spin'
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          {unhandledAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unhandledAlerts}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-gray-200 mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500">
                {currentUser.role === 'manager' ? '园区负责人' : '技术员'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card border border-gray-100 py-2 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">切换身份</p>
              </div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowUserMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                    currentUser.id === user.id && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{user.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {user.role === 'manager' ? '负责人' : '技术员'}
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>设置</span>
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
