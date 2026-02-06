import { StatusBar } from 'react-native';
import { createTamagui, TamaguiProvider } from '@tamagui/core'
import { defaultConfig } from '@tamagui/config/v5'
import { Button } from 'tamagui'


const config = createTamagui(defaultConfig)
type Conf = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <StatusBar barStyle="dark-content" />
      <Button>Lorem ipsum</Button>
    </TamaguiProvider>
  );
}

