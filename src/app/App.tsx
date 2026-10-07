import { StatusBar } from 'expo-status-bar';

import { MockAdOverlay } from '../components/overlays/MockAdOverlay';
import { Backdrop } from '../components/ui/Backdrop';
import { Toast } from '../components/ui/Toast';
import { AppNavigator } from './AppNavigator';
import { AppProvider } from './AppProvider';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <Backdrop />
      <AppNavigator />
      <Toast />
      <MockAdOverlay />
    </AppProvider>
  );
}
