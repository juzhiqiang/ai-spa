import Dapp from '@/pages/Dapp';
import Loading from '@components/common/Loading';
import PageNotFoundView from '@components/common/PageNotFoundView';
import MainLayout from '@layouts/Layout';
import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
const Layout = () => (
  <Suspense fallback={<Loading />}>
    <MainLayout />
  </Suspense>
);

//懒加载
// const Test = lazy(() => import('@components/test/Index'));

const Routes: RouteObject[] = [];

const mainRoutes = {
  path: '/',
  element: <Layout />,
  children: [
    { path: '*', element: <PageNotFoundView /> },
    { path: '/dapp', element: <Dapp /> },
    { path: '404', element: <PageNotFoundView /> },
  ],
};

const DemoRoutes = {
  path: 'yideng',
  element: <Layout />,
  children: [{ path: 'test', element: <PageNotFoundView /> }],
};

Routes.push(mainRoutes, DemoRoutes);

export default Routes;
