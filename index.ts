import React from 'react';
import { registerRootComponent } from 'expo';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { installWebAlert } from './utils/webAlert';

// Sur le web, Alert.alert est un no-op : on le remplace par window.alert/confirm
// AVANT le premier rendu.
installWebAlert();

// ErrorBoundary évite la page blanche en cas de crash de rendu.
function Root() {
  return React.createElement(ErrorBoundary, null, React.createElement(App));
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => Root);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
