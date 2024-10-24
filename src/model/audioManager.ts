import { DatabaseManager } from './databaseManager';
import { Track } from './track';

export class AudioManager {
    private audio: HTMLAudioElement | null = null;
    private dbManager: DatabaseManager;

    constructor() {
        this.CreateAudioElement();
        this.dbManager = new DatabaseManager();
    }

    async playTrack(track: Track, isStartOver: boolean): Promise<void> {
        if (!this.audio) {
            console.log("audio not found.");
            return;
        }

        if (isStartOver) {
            this.stopTrack();

            console.log("here");

            try {
                const trackFromDB = await this.dbManager.getTrack(track.id);
                if (trackFromDB) {
                    console.log("id db");
                    this.audio.src = URL.createObjectURL(trackFromDB.audioBlob);
                } else {
                    console.log("fetch");
                    this.audio.src = track.track_url;
                    await this.dbManager.fetchAndStoreTrack(track);
                }
            } catch (error) {
                console.error('Error fetching or storing track:', error);
            }
        } else {
            this.audio?.play();
        }
    }

    private CreateAudioElement(): HTMLAudioElement {
        this.audio = document.createElement('audio');
        this.audio.id = "audio-element";
        this.audio.preload = 'metadata';
        document.body.appendChild(this.audio);

        return this.audio;
    }
    
    getAudioElement(): HTMLAudioElement | null {
        return this.audio;
    }

    pauseTrack(): void {
        if (this.audio) {
            this.audio.pause();
        }
    }

    stopTrack(): void {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    setOnEnded(callback: () => void): void {
        if (this.audio) {
            this.audio.onended = callback;
        }
    }
}
