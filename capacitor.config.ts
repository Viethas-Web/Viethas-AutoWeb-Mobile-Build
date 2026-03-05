import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.viethas.autoweb',
  appName: 'Demo AutoWebApp',
  webDir: 'dist/autoweb-build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
