import { memo } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <>
            <main className="mx-auto">
                <Outlet />
            </main>
        </>
    );
};
// MainLayout.whyDidYouRender = true;
export default memo(MainLayout);
