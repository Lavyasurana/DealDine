import admin from "firebase-admin";
import fs from "fs";
import path from "path";

 /*const serviceAccount = JSON.parse(

  fs.readFileSync("/etc/secrets/serviceAccountKey.json", "utf-8")
);*/

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "services", "serviceAccountKey.json"),
    "utf-8"
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export default admin;