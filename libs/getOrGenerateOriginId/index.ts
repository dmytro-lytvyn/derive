// Config
import * as SecureStore from 'expo-secure-store';
// UUID
//import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

async function getOrGenerateOriginId(): void {
  var originId = await SecureStore.getItemAsync('originId');
  if (!originId) {
    originId = uuidv4();
    await SecureStore.setItemAsync('originId', originId);
  }
  console.log(`Current originId = ${originId}`);
}

export default getOrGenerateOriginId;
