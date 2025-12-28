import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import uzUz from 'antd/locale/uz_UZ';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';

const myTheme = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorTextBase: '#000000d9',
    colorBgContainer: '#ffffff',
    colorBgContainerDisabled: '#00000014',
  },
  components: {
    // Button: {
    //   colorPrimary: '#1677ff',
    //   colorSuccess: '#52c41a',
    //   colorWarning: '#faad14',
    //   colorError: '#f5222d',
    //   colorTextBase: '#000000d9',
    //   colorBgContainer: '#ffffff',
    //   colorBgContainerDisabled: '#00000014',
    // }
  },
};

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={uzUz} theme={{ ...myTheme }}>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </ConfigProvider>
  </QueryClientProvider>,
);
