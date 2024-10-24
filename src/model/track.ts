import data from '../data/tracks.json';
import { DatabaseManager } from './databaseManager';
import { AudioManager } from './audioManager';


export interface Track {
    id: number;
    track_name: string;
    track_time: string;
    track_url: string;
    track_thumb: string;
    nonce: string;
    composer: string;
}

export enum RepeatMode {
    OFF,
    REPEAT,
}


export default class TrackModel {
    private tracks: Track[] = [];
    private currentTrackIndex: number = 0;
    private isInitialState: boolean = true;
    private isShuffle: boolean = false;
    private repeatMode: RepeatMode = RepeatMode.OFF;
    private isPlaying: boolean = false;
    private prevTracksQueue: number[] = [];

    private dbManager: DatabaseManager;
    private audioManager: AudioManager;

    constructor() {
        this.dbManager = new DatabaseManager();
        this.loadTracks();
        this.audioManager = new AudioManager();
    }

    private async loadTracks(): Promise<void> {
        try {
            this.tracks = data;
            await this.dbManager.loadTracks();
        } catch (error) {
            console.error('Error loading tracks:', error);
        }
    }

    private updateOnEndedTrack(): void {
        this.audioManager.setOnEnded(() => {
            this.stopTrack();
            
            if (this.repeatMode === RepeatMode.REPEAT) {
                this.playTrack();
            } else {
                this.nextTrack();
                this.playTrack();
            }
        });
    }
    
    private saveLastPlayedTrackId(trackId: number): void {
        this.prevTracksQueue.push(trackId);
    }
    
    private getLastPlayedTrackId(): number {
        return this.prevTracksQueue.pop()!;
    }

    private getRandomTrackId(): number {
        const randomIndex = Math.floor(Math.random() * this.tracks.length);
        return randomIndex;
    }

    getTracks(): Track[] {
        return this.tracks;
    }

    IsTrackPlaying(): boolean {
        return this.isPlaying;
    }

    toggleIsTrackPlaying(): void {
        this.isPlaying = !this.IsTrackPlaying();
    }

    getCurrentTrack(): Track | null {
        if (this.isInitialState) {
            return null;
        }

        return this.getTracks()[this.currentTrackIndex];
    }

    setCurrentTrack(trackId: number): void {
        this.isInitialState = false;
        this.currentTrackIndex = trackId;
    }

    IsTrackListShuffle(): boolean {
        return this.isShuffle;
    }

    setShuffle(isShuffle: boolean): void {
        this.isShuffle = isShuffle;
    }

    getRepeatMode(): RepeatMode {
        return this.repeatMode;
    }

    setRepeatMode(mode: RepeatMode): void {
        this.repeatMode = mode;
        this.updateOnEndedTrack();
    }

    nextTrack(): Track {
        if (this.isShuffle) {
            const randomTrackId = this.getRandomTrackId();
            this.setCurrentTrack(randomTrackId);
        } else {
            this.setCurrentTrack(
                (this.currentTrackIndex + 1) % this.getTracks().length
            );
        }

        this.saveLastPlayedTrackId(this.currentTrackIndex);
        return this.getCurrentTrack()!;
    }

    prevTrack(): Track {
        if (this.prevTracksQueue.length > 0) {
            const lastPlayedTrackId = this.getLastPlayedTrackId();
            this.setCurrentTrack(lastPlayedTrackId!);
        } else {
            this.setCurrentTrack( 
                (this.currentTrackIndex - 1 + this.getTracks().length) % this.getTracks().length
            );
        }

        return this.getCurrentTrack()!;
    }

    selectTrack(trackId: number): void {
        this.saveLastPlayedTrackId(trackId);
        this.setCurrentTrack(trackId);
    }

    playTrack(isStartOver: boolean = true): void {
        if (!this.isPlaying) {
            const track = this.getCurrentTrack()!;
            this.audioManager.playTrack(track, isStartOver);

            this.updateOnEndedTrack();
            this.toggleIsTrackPlaying();    
        }
    }

    pauseTrack(): void {
        if (this.isPlaying) {
            this.audioManager.pauseTrack();
            this.toggleIsTrackPlaying();
        }
    }

    stopTrack(): void {
        if (this.isPlaying) {
            this.audioManager.stopTrack();
            this.toggleIsTrackPlaying();
        }
    }

    getAudioElement(): HTMLAudioElement| null {
        return this.audioManager.getAudioElement();
    }
}
