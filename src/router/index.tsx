import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Plots from '@/pages/Plots';
import Sensors from '@/pages/Sensors';
import Plans from '@/pages/Plans';
import Records from '@/pages/Records';
import Alerts from '@/pages/Alerts';
import Statistics from '@/pages/Statistics';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/plots', element: <Plots /> },
      { path: '/sensors', element: <Sensors /> },
      { path: '/plans', element: <Plans /> },
      { path: '/records', element: <Records /> },
      { path: '/alerts', element: <Alerts /> },
      { path: '/statistics', element: <Statistics /> },
    ],
  },
]);
