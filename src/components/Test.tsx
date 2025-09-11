import { useImmer } from '@/hooks/useImmer';
import { useEffect } from 'react';

const Index = () => {
    const [text, setText] = useImmer({ data: '123', info: '123' });

    useEffect(() => {

        setText(draft => {
            draft.data = '123';
        });
    }, [setText]);
    
    return <div>{text.data}</div>;
};

Index.whyDidYouRender = true;
export default Index;
