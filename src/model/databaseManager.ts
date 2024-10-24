import { Track } from './track';


export class DatabaseManager {
    private database: IDBDatabase | null = null;

    constructor() {
        this.initDB();
    }

    initDB(): void {
        const request = indexedDB.open('music-player', 1);

        request.onsuccess = (event) => {
            this.database = (event.target as IDBOpenDBRequest).result;
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('tracks', { keyPath: 'id' });
        };
    }

    async loadTracks(): Promise<Track[]> {  
        if (!this.database) return [];

        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(['tracks'], 'readonly');
            const store = transaction.objectStore('tracks');
            const request = store.getAll(); 

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getTrack(trackId: number): Promise<any> {
        if (!this.database) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(['tracks'], 'readonly');
            const store = transaction.objectStore('tracks');
            const request = store.get(trackId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async fetchAndStoreTrack(track: Track): Promise<void> {
        const response = await fetch(track.track_url);
        const audioBlob = await response.blob();
        this.storeTrack(track, audioBlob);
    }

    private storeTrack(track: Track, audioBlob: Blob): void {
        if (!this.database) return;

        const transaction = this.database.transaction(['tracks'], 'readwrite');
        const store = transaction.objectStore('tracks');
        const trackWithBlob = { ...track, audioBlob };
        store.put(trackWithBlob);
    }
}
