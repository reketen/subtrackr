/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from 'firebase-admin';

export function getAdminDb() {
    if (!admin.apps.length) {
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error('FIREBASE_PROJECT_ID is not configured');
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines in private key
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return admin.firestore();
}

// Proxy export for backward compatibility so adminDb.collection(...) works seamlessly
export const adminDb = new Proxy({} as FirebaseFirestore.Firestore, {
    get(_target, prop) {
        const db = getAdminDb();
        const value = (db as any)[prop];
        return typeof value === 'function' ? value.bind(db) : value;
    },
});
