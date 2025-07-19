import CloudBaseService from './CloudBaseService';

class DatabaseService {
  collection(name) {
    return {
      add: (data) => CloudBaseService.addDoc(name, data),
      get: () => CloudBaseService.getCollection(name),
      doc: (docId) => this.doc(name, docId)
    };
  }

  doc(collectionName, docId) {
    return {
      collectionName,
      docId,
      get: () => CloudBaseService.getDoc(collectionName, docId),
      set: (data) => CloudBaseService.setDoc(collectionName, docId, data),
      update: (data) => CloudBaseService.updateDoc(collectionName, docId, data),
      delete: () => CloudBaseService.deleteDoc(collectionName, docId)
    };
  }

  onSnapshot(docRef, callback) {
    return CloudBaseService.onSnapshot(docRef, callback);
  }

  getDoc(docRef) {
    return CloudBaseService.getDoc(docRef.collectionName, docRef.docId);
  }

  setDoc(docRef, data) {
    return CloudBaseService.setDoc(docRef.collectionName, docRef.docId, data);
  }

  updateDoc(docRef, data) {
    return CloudBaseService.updateDoc(docRef.collectionName, docRef.docId, data);
  }
}

export default new DatabaseService();
