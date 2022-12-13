import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyC59tQwH8q_ri32lcWoG1WDXoVQeFArSyc",
  authDomain: "webex16-team2.firebaseapp.com",
  projectId: "webex16-team2",
  storageBucket: "webex16-team2.appspot.com",
  messagingSenderId: "133220401460",
  appId: "1:133220401460:web:c4312a2a4b00af57966561",
  measurementId: "G-JGB787SV7W",
  databaseURL:
    "https://webex16-team2-default-rtdb.asia-southeast1.firebasedatabase.app/",
}

// Firebaseアプリオブジェクトを初期化
const app = initializeApp(firebaseConfig)
// Firestoreを読み込み、db(databaseの略)として export
export const db = getDatabase(app)
