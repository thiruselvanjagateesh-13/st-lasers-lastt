// firebase.js - initializes Firebase (Firestore) and provides simple helpers
// NOTE: This file expects the Firebase compat SDKs to already be loaded in the page.

const firebaseConfig = {
  apiKey: "AIzaSyAK64eSKDRPLes3ekAXSjotZW_8wHHq1XI",
  authDomain: "proj-adf8a.firebaseapp.com",
  projectId: "proj-adf8a",
  storageBucket: "proj-adf8a.firebasestorage.app",
  messagingSenderId: "73183599221",
  appId: "1:73183599221:web:2b8d67a4626a6b9e2b763c",
  measurementId: "G-Y4R46EE8H7"
};

// Initialize Firebase app and Firestore (compat layer)
if (!window.firebase || !window.firebase.initializeApp) {
  console.error('Firebase compat SDK not loaded. Please include firebase-app-compat.js and firebase-firestore-compat.js before this file.');
} else {
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const inventoryCollection = db.collection('inventory');

  window._firebase = {
    db,

    // Add a new invoice document to 'invoices' collection. Returns the new doc id.
    addInvoice: async function(bill) {
      const docRef = await db.collection('invoices').add({
        inv_no: bill.invNo,
        customer_name: bill.customer,
        bill_date: bill.date,
        grand_total: parseFloat(bill.grandTotal) || 0,
        all_data: bill,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    },

    // Get invoices ordered by created_at desc. Returns array of {id, ...data}
    getInvoices: async function() {
      const snapshot = await db.collection('invoices').orderBy('created_at', 'desc').get();
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // Get invoice by document id. Returns {id, ...data} or null
    getInvoiceById: async function(id) {
      const d = await db.collection('invoices').doc(id).get();
      if (!d.exists) return null;
      return { id: d.id, ...d.data() };
    },

    // Delete invoice document by id
    deleteInvoice: async function(id) {
      await db.collection('invoices').doc(id).delete();
    },

    getInventory: async function() {
      const snapshot = await inventoryCollection.get();
      return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
    },

    initializeInventory: async function(products) {
      const existing = await inventoryCollection.limit(1).get();
      if (!existing.empty || !products.length) return false;

      const batch = db.batch();
      products.forEach(product => {
        const document = product.id && !product.id.includes('/')
          ? inventoryCollection.doc(product.id)
          : inventoryCollection.doc();
        batch.set(document, {
          name: product.name || '',
          sku: product.sku || '',
          category: product.category || '',
          quantity: Number(product.quantity) || 0,
          price: Number(product.price) || 0,
          reorderLevel: Number(product.reorderLevel) || 0,
          is_sample: Boolean(product.is_sample || product.isSample),
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      return true;
    },

    addInventoryProduct: async function(product) {
      const document = await inventoryCollection.add({
        ...product,
        is_sample: false,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      });
      return document.id;
    },

    updateInventoryProduct: async function(id, product) {
      await inventoryCollection.doc(id).set({
        ...product,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    },

    deleteInventoryProduct: async function(id) {
      await inventoryCollection.doc(id).delete();
    }
  };
}
