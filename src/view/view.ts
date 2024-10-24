import '../styles/style.scss';
import initImage from '../../public/initState.png';
import { Track, RepeatMode } from '../model/track';


export default class TrackView {
    onPlayPauseButtonClick: () => void = () => {};
    onNextTrackButtonClick: () => void = () => {};
    onPrevTrackButtonClick: () => void = () => {};
    onToggleShuffleButtonClick: () => void = () => {};
    onToggleRepeatButtonClick: () => void = () => {};
    onSelectTrackItem: (trackId: number) => void = () => {};
    onEndedTrack: () => void = () => {};
    onProgressBarInput: (event: Event, audio: HTMLAudioElement) => void = () => {};

    private audio: HTMLAudioElement | null;
    private container: HTMLElement;
    private currentTrackId: number | undefined;

    constructor(container: HTMLElement, audioElement: HTMLAudioElement | null) {
        this.container = container;
        this.container.innerHTML = '';
        this.audio = audioElement;
        this.currentTrackId = undefined;
    }

    render (
        tracks: Track[], 
        currTrack: Track | null, 
        isShuffle: boolean, 
        repeatMode: RepeatMode, 
        isPlaying: boolean, 
        audioElement: HTMLAudioElement | null,
        currentTrackId: number | undefined
    ): void {
        this.container.innerHTML = '';
        this.currentTrackId = currentTrackId;

        const stickyNav = this.displayStickyNav(
            currTrack, isShuffle, repeatMode, isPlaying
        );

        const trackListElement = this.displayTrackList(tracks);

        this.container.appendChild(stickyNav);
        this.container.appendChild(trackListElement);

        this.audio = audioElement;
    }

    private addTrackItemEvents(item: HTMLElement, trackId: number): void {
        item.addEventListener(
            "click", () => this.onSelectTrackItem(trackId)
        );
    }  

    private addAudioEvents(singleTrackView: HTMLDivElement): void {
        if (!this.audio) {
            return;
        }

        this.audio.addEventListener('canplaythrough', () => {
            this.audio!.play();
            const progressBar = singleTrackView.querySelector("#progress-bar") as HTMLInputElement;
            progressBar.max = this.audio!.duration.toString();
        });

        this.audio.addEventListener(
            "timeupdate", () => {
                const audioTimerElement = singleTrackView.querySelector("#current-time") as HTMLElement;
                const progressBar = singleTrackView.querySelector("#progress-bar") as HTMLInputElement;
                
                audioTimerElement.textContent = this.getAudioCurrentTime();
        
                if (this.audio!.duration) {
                    progressBar.value = this.audio!.currentTime.toString();
                }
            }
        )

        this.audio.addEventListener("ended", () => this.onEndedTrack());
    }

    private addCurrentTrackEvents(singleTrackView: HTMLDivElement): void {
        const playPauseButton = singleTrackView.querySelector('#play-pause-btn') as HTMLElement;
        playPauseButton.addEventListener(
            "click", () => this.onPlayPauseButtonClick()
        );
        
        const nextButton = singleTrackView.querySelector('#next-track-btn') as HTMLElement;
        nextButton.addEventListener(
            "click", () => this.onNextTrackButtonClick()
        );

        const prevButton = singleTrackView.querySelector('#prev-track-btn') as HTMLElement;
        prevButton.addEventListener(
            "click", () => this.onPrevTrackButtonClick()
        );

        const toggleShuffleButton = singleTrackView.querySelector('#toggle-shuffle-btn') as HTMLElement;
        toggleShuffleButton.addEventListener(
            "click", () => this.onToggleShuffleButtonClick()
        );

        const toggleRepeatModeButton = singleTrackView.querySelector('#toggle-repeat-mode-btn') as HTMLElement;
        toggleRepeatModeButton.addEventListener(
            "click", () => this.onToggleRepeatButtonClick()
        );

        const progressBar = singleTrackView.querySelector('#progress-bar') as HTMLInputElement;
        progressBar.addEventListener(
            "input", (event) => this.onProgressBarInput(event, this.audio!))
    }

    private displayStickyNav(
        currTrack: Track | null, 
        isShuffle: boolean, 
        repeatMode: RepeatMode, 
        isPlaying: boolean, 
    ): HTMLElement {
        const stickyNav = document.createElement("div") as HTMLElement;
        stickyNav.id = "sticky-nav";

        const currTrackElement = this.displayCurrTrack(
            currTrack, isShuffle, repeatMode, isPlaying, 
        );

        stickyNav.appendChild(currTrackElement);

        return stickyNav;
    }

    private displayTrackList(tracks: Track[]): HTMLElement {    
        const trackList = document.createElement("div");
        trackList.id = "track-list";

        tracks.forEach((track, index) => {
            const item = document.createElement("div") as HTMLElement;
            item.className = "item";
            if (this.currentTrackId === track.id) {
                item.id = "selected-track";
            }

            item.innerHTML = `
            <div class="item-info">
                <img src=${track.track_thumb} />
                <div>
                    <h3>${track.track_name}</h3>
                    <p>${track.composer}</p>
                </div>
            </div>
            <div>
                <p>${track.track_time}</p>  
            </div>
            `;

            this.addTrackItemEvents(item, index);
            trackList.appendChild(item);
        });

        return trackList;
    }

    private displayCurrTrack(
        currentTrack: Track | null, 
        isShuffle: boolean, 
        repeatMode: RepeatMode, 
        isPlaying: boolean, 
    ): HTMLElement {
        const singleTrackView = document.createElement("div");
        singleTrackView.id = "curr-track";

        singleTrackView.innerHTML = `
            ${currentTrack ?
            `
            <div class="music-cover">
                <img src="${currentTrack.track_thumb}" />
                <div>
                    <h3 ${currentTrack.track_name.length > 19 ? `class="scroll"` : ``}>
                        ${currentTrack.track_name}
                    </h3>
                </div>
                <p>${currentTrack.composer}</p>
            </div>
        
            <div id="audio-player">
                <div id="time-line">
                    <input type="range" id="progress-bar" value="${this.audio!.currentTime.toString()}" max="${this.audio!.duration.toString()}" min="0" step="0.1">
                
                    <div id="timers">
                        <span id="current-time">${this.getAudioCurrentTime()}</span>
                        <span id="duration-time">${currentTrack.track_time}</span>
                    </div>
                </div>

                <div id="controls">
                    <button id="toggle-shuffle-btn">
                        ${this.displayShuffleButtonIcon(isShuffle)}
                    </button>

                    <div>    
                        <button id="prev-track-btn">
                            ${this.displayPrevTrackButtonIcon()}
                        </button>
                        <button id="play-pause-btn">
                            ${this.displayPlayPauseButtonIcon(isPlaying)}
                        </button>
                        <button id="next-track-btn">
                            ${this.displayNextTrackButtonIcon()}
                        </button>
                    </div>
                    
                    <button id="toggle-repeat-mode-btn">
                        ${this.displayRepeatModeButtonIcon(repeatMode)}
                    </button>
                </div>
            </div>
            `
            :
            `
            <img src="${initImage}" id="init-image" />
            `}
        `;

        if (currentTrack) {
            this.addCurrentTrackEvents(singleTrackView);
            this.addAudioEvents(singleTrackView);
        }

        return singleTrackView;
    }

    private displayShuffleButtonIcon(isShuffle: boolean): string {
        return isShuffle ? this.displayShuffleIcon(true) : this.displayShuffleIcon(false);
    }

    private displayShuffleIcon(active: boolean): string {
        return active ?
        `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.4518 6.76183C15.8004 6.75468 15.1861 7.08482 14.824 7.62791L8.43404 17.2079C8.434 17.2079 8.43407 17.2078 8.43404 17.2079C7.79266 18.1698 6.70658 18.7418 5.54999 18.7418L5.54705 18.7418L2.99706 18.7318C2.58285 18.7302 2.24838 18.3931 2.25001 17.9789C2.25163 17.5647 2.58873 17.2302 3.00294 17.2319L5.54999 17.2418C5.55044 17.2418 5.5509 17.2418 5.55135 17.2418C6.21418 17.2414 6.82757 16.9134 7.18596 16.3758L13.576 6.79586C13.576 6.79581 13.5759 6.79591 13.576 6.79586C14.2134 5.83976 15.298 5.24997 16.4656 5.2619C16.4665 5.26191 16.4674 5.26191 16.4682 5.26192L21.0133 5.2819C21.4275 5.28372 21.7618 5.62098 21.76 6.03519C21.7582 6.4494 21.4209 6.7837 21.0067 6.78188L16.4567 6.76187L16.4518 6.76183Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M21.5303 17.4501C21.8232 17.743 21.8232 18.2179 21.5303 18.5108L19.5303 20.5108C19.2374 20.8037 18.7626 20.8037 18.4697 20.5108C18.1768 20.2179 18.1768 19.743 18.4697 19.4501L20.4697 17.4501C20.7626 17.1572 21.2374 17.1572 21.5303 17.4501Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 15.4697C18.7626 15.1768 19.2374 15.1768 19.5303 15.4697L21.5303 17.4697C21.8232 17.7626 21.8232 18.2374 21.5303 18.5303C21.2374 18.8232 20.7626 18.8232 20.4697 18.5303L18.4697 16.5303C18.1768 16.2374 18.1768 15.7626 18.4697 15.4697Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.41914 6.68262C8.41921 6.68273 8.41906 6.68252 8.41914 6.68262L9.49866 8.18194C9.74069 8.51809 9.66439 8.9868 9.32824 9.22882C8.99209 9.47085 8.52339 9.39455 8.28136 9.05841L7.20135 7.55841C6.8318 7.04394 6.24029 6.74298 5.61861 6.75013L5.61287 6.75019L3.00288 6.76018C2.58867 6.76177 2.25159 6.42727 2.25001 6.01306C2.24842 5.59885 2.58291 5.26178 2.99712 5.26019L5.60442 5.25019C6.72146 5.23835 7.76926 5.77811 8.41914 6.68262Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5086 14.7867C12.8356 14.5325 13.3068 14.5916 13.561 14.9187L14.7822 16.4903C15.1483 16.9641 15.7275 17.2485 16.3373 17.2489C16.3378 17.2489 16.3383 17.2489 16.3388 17.2489L21.0055 17.2289C21.4197 17.2271 21.757 17.5615 21.7587 17.9757C21.7605 18.3899 21.4262 18.7271 21.012 18.7289L16.342 18.7489L16.3388 18.7489C15.2695 18.7489 14.2496 18.2537 13.596 17.4084C13.5957 17.4081 13.5955 17.4078 13.5953 17.4075L12.3765 15.8391C12.1224 15.512 12.1815 15.0408 12.5086 14.7867Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 3.4892C18.7626 3.19631 19.2374 3.19631 19.5303 3.4892L21.5303 5.4892C21.8232 5.78209 21.8232 6.25697 21.5303 6.54986C21.2374 6.84275 20.7626 6.84275 20.4697 6.54986L18.4697 4.54986C18.1768 4.25697 18.1768 3.78209 18.4697 3.4892Z" fill="#1ED760"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 8.53033C18.1768 8.23744 18.1768 7.76256 18.4697 7.46967L20.4697 5.46967C20.7626 5.17678 21.2374 5.17678 21.5303 5.46967C21.8232 5.76256 21.8232 6.23744 21.5303 6.53033L19.5303 8.53033C19.2374 8.82322 18.7626 8.82322 18.4697 8.53033Z" fill="#1ED760"/>
        </svg>  
        ` :
        `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.4518 6.76183C15.8004 6.75468 15.1861 7.08482 14.824 7.62791L8.43404 17.2079C8.434 17.2079 8.43407 17.2078 8.43404 17.2079C7.79266 18.1698 6.70658 18.7418 5.54999 18.7418L5.54705 18.7418L2.99706 18.7318C2.58285 18.7302 2.24838 18.3931 2.25001 17.9789C2.25163 17.5647 2.58873 17.2302 3.00294 17.2319L5.54999 17.2418C5.55044 17.2418 5.5509 17.2418 5.55135 17.2418C6.21418 17.2414 6.82757 16.9134 7.18596 16.3758L13.576 6.79586C13.5759 6.79591 13.576 6.79581 13.576 6.79586C14.2134 5.83976 15.298 5.24997 16.4656 5.2619C16.4665 5.26191 16.4674 5.26191 16.4682 5.26192L21.0133 5.2819C21.4275 5.28372 21.7618 5.62098 21.76 6.03519C21.7582 6.4494 21.4209 6.7837 21.0067 6.78188L16.4567 6.76187L16.4518 6.76183Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M21.5303 17.4501C21.8232 17.743 21.8232 18.2179 21.5303 18.5108L19.5303 20.5108C19.2374 20.8037 18.7626 20.8037 18.4697 20.5108C18.1768 20.2179 18.1768 19.743 18.4697 19.4501L20.4697 17.4501C20.7626 17.1572 21.2374 17.1572 21.5303 17.4501Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 15.4697C18.7626 15.1768 19.2374 15.1768 19.5303 15.4697L21.5303 17.4697C21.8232 17.7626 21.8232 18.2374 21.5303 18.5303C21.2374 18.8232 20.7626 18.8232 20.4697 18.5303L18.4697 16.5303C18.1768 16.2374 18.1768 15.7626 18.4697 15.4697Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.41914 6.68262C8.41906 6.68252 8.41921 6.68273 8.41914 6.68262L9.49866 8.18194C9.74069 8.51809 9.66439 8.9868 9.32824 9.22882C8.99209 9.47085 8.52339 9.39455 8.28136 9.05841L7.20135 7.55841C6.8318 7.04394 6.24029 6.74298 5.61861 6.75013L5.61287 6.75019L3.00288 6.76018C2.58867 6.76177 2.25159 6.42727 2.25001 6.01306C2.24842 5.59885 2.58291 5.26178 2.99712 5.26019L5.60442 5.25019C6.72146 5.23835 7.76926 5.77811 8.41914 6.68262Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5086 14.7867C12.8357 14.5325 13.3068 14.5916 13.561 14.9187L14.7822 16.4903C15.1483 16.9641 15.7275 17.2485 16.3373 17.2489C16.3378 17.2489 16.3383 17.2489 16.3388 17.2489L21.0056 17.2289C21.4198 17.2271 21.757 17.5615 21.7588 17.9757C21.7606 18.3899 21.4262 18.7271 21.012 18.7289L16.342 18.7489L16.3388 18.7489C15.2695 18.7489 14.2496 18.2537 13.596 17.4084C13.5958 17.4081 13.5955 17.4078 13.5953 17.4075L12.3766 15.8391C12.1224 15.512 12.1815 15.0408 12.5086 14.7867Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 3.4892C18.7626 3.19631 19.2374 3.19631 19.5303 3.4892L21.5303 5.4892C21.8232 5.78209 21.8232 6.25697 21.5303 6.54986C21.2374 6.84275 20.7626 6.84275 20.4697 6.54986L18.4697 4.54986C18.1768 4.25697 18.1768 3.78209 18.4697 3.4892Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.4697 8.53033C18.1768 8.23744 18.1768 7.76256 18.4697 7.46967L20.4697 5.46967C20.7626 5.17678 21.2374 5.17678 21.5303 5.46967C21.8232 5.76256 21.8232 6.23744 21.5303 6.53033L19.5303 8.53033C19.2374 8.82322 18.7626 8.82322 18.4697 8.53033Z" fill="white"/>
        </svg>
        `;
    }

    private displayPrevTrackButtonIcon(): string {
        return `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 17C0 17.5523 0.447715 18 1 18C1.55228 18 2 17.5523 2 17L2 1C2 0.447716 1.55229 0 1 0C0.447717 0 0 0.447716 0 1V17ZM18 16.0526C18 17.4774 16.3883 18.305 15.2303 17.4748L4.76062 9.96823C3.75574 9.24775 3.79467 7.74068 4.8354 7.07304L15.3051 0.356647C16.4698 -0.390535 18 0.445827 18 1.82961L18 16.0526Z" fill="white"/>
        </svg>
        `;
    }

    private displayPlayPauseButtonIcon(isPlaying: boolean): string {
        return isPlaying ? this.displayPauseIcon() : this.displayPlayIcon();
    }

    private displayPlayIcon(): string {
        return `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM13 12.2537C13 10.5161 14.8435 9.43411 16.3102 10.3109L28.0686 17.3398C29.3105 18.0822 29.3105 19.9179 28.0686 20.6603L16.3102 27.6891C14.8435 28.5659 13 27.4839 13 25.7463V12.2537Z" fill="white"/>
        </svg>
        `;
    }

    private displayPauseIcon(): string {
        return `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM23.5 12C22.6716 12 22 12.6716 22 13.5V26.5C22 27.3284 22.6716 28 23.5 28H25.5C26.3284 28 27 27.3284 27 26.5V13.5C27 12.6716 26.3284 12 25.5 12H23.5ZM14.5 12C13.6716 12 13 12.6716 13 13.5V26.5C13 27.3284 13.6716 28 14.5 28H16.5C17.3284 28 18 27.3284 18 26.5V13.5C18 12.6716 17.3284 12 16.5 12H14.5Z" fill="white"/>
        </svg>
        `;
    }

    private displayNextTrackButtonIcon(): string {
        return `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 17C18 17.5523 17.5523 18 17 18C16.4477 18 16 17.5523 16 17L16 1C16 0.447716 16.4477 0 17 0C17.5523 0 18 0.447716 18 1V17ZM1.90735e-06 16.0526C1.90735e-06 17.4774 1.61175 18.305 2.7697 17.4748L13.2394 9.96823C14.2443 9.24775 14.2053 7.74068 13.1646 7.07304L2.69492 0.356647C1.5302 -0.390535 0 0.445827 0 1.82961L1.90735e-06 16.0526Z" fill="white"/>
        </svg>
        `;
    }

    private displayRepeatModeButtonIcon(repeatMode: RepeatMode): string {
        if (repeatMode === RepeatMode.REPEAT) {
            return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.82812 5.16016C2.82812 4.74594 3.16391 4.41016 3.57812 4.41016H17.4182C19.4924 4.41016 21.1682 6.08594 21.1682 8.16016V11.4801C21.1682 11.8944 20.8324 12.2301 20.4182 12.2301C20.004 12.2301 19.6682 11.8944 19.6682 11.4801V8.16016C19.6682 6.91437 18.664 5.91016 17.4182 5.91016H3.57812C3.16391 5.91016 2.82812 5.57437 2.82812 5.16016Z" fill="#1ED760"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.26846 1.46967C7.56135 1.76257 7.56135 2.23744 7.26845 2.53033L4.63878 5.15998L7.26846 7.78968C7.56135 8.08258 7.56135 8.55745 7.26845 8.85034C6.97556 9.14324 6.50068 9.14323 6.20779 8.85034L3.04779 5.6903C2.7549 5.3974 2.7549 4.92253 3.0478 4.62964L6.2078 1.46967C6.50069 1.17678 6.97557 1.17678 7.26846 1.46967Z" fill="#1ED760"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.57812 11.7695C3.99234 11.7695 4.32812 12.1053 4.32812 12.5195V15.8395C4.32812 17.0853 5.33234 18.0895 6.57812 18.0895H20.4182C20.8324 18.0895 21.1682 18.4253 21.1682 18.8395C21.1682 19.2537 20.8324 19.5895 20.4182 19.5895H6.57812C4.50391 19.5895 2.82812 17.9137 2.82812 15.8395V12.5195C2.82812 12.1053 3.16391 11.7695 3.57812 11.7695Z" fill="#1ED760"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7314 15.1493C17.0243 14.8565 17.4992 14.8565 17.7921 15.1494L20.9521 18.3095C21.2449 18.6024 21.2449 19.0772 20.952 19.3701L17.792 22.53C17.4991 22.8229 17.0243 22.8229 16.7314 22.53C16.4385 22.2371 16.4385 21.7622 16.7314 21.4693L19.3611 18.8398L16.7314 16.21C16.4385 15.9171 16.4385 15.4422 16.7314 15.1493Z" fill="#1ED760"/>
            </svg>
            `;
        } else {
            return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.82812 5.16016C2.82812 4.74594 3.16391 4.41016 3.57812 4.41016H17.4182C19.4924 4.41016 21.1682 6.08594 21.1682 8.16016V11.4801C21.1682 11.8944 20.8324 12.2301 20.4182 12.2301C20.004 12.2301 19.6682 11.8944 19.6682 11.4801V8.16016C19.6682 6.91437 18.664 5.91016 17.4182 5.91016H3.57812C3.16391 5.91016 2.82812 5.57437 2.82812 5.16016Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.26846 1.46967C7.56135 1.76257 7.56135 2.23744 7.26845 2.53033L4.63878 5.15998L7.26846 7.78968C7.56135 8.08258 7.56135 8.55745 7.26845 8.85034C6.97556 9.14324 6.50068 9.14323 6.20779 8.85034L3.04779 5.6903C2.7549 5.3974 2.7549 4.92253 3.0478 4.62964L6.2078 1.46967C6.50069 1.17678 6.97557 1.17678 7.26846 1.46967Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.57812 11.7695C3.99234 11.7695 4.32812 12.1053 4.32812 12.5195V15.8395C4.32812 17.0853 5.33234 18.0895 6.57812 18.0895H20.4182C20.8324 18.0895 21.1682 18.4253 21.1682 18.8395C21.1682 19.2537 20.8324 19.5895 20.4182 19.5895H6.57812C4.50391 19.5895 2.82812 17.9137 2.82812 15.8395V12.5195C2.82812 12.1053 3.16391 11.7695 3.57812 11.7695Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M16.7314 15.1493C17.0243 14.8565 17.4992 14.8565 17.7921 15.1494L20.9521 18.3095C21.2449 18.6024 21.2449 19.0772 20.952 19.3701L17.792 22.53C17.4991 22.8229 17.0243 22.8229 16.7314 22.53C16.4385 22.2371 16.4385 21.7622 16.7314 21.4693L19.3611 18.8398L16.7314 16.21C16.4385 15.9171 16.4385 15.4422 16.7314 15.1493Z" fill="white"/>
            </svg>
            `;
        }
    }

    private getAudioCurrentTime(): string {
        if (!this.audio) {
            return '0:00';
        }

        const minutes = Math.floor(this.audio.currentTime / 60).toString();
        const seconds = Math.floor(this.audio.currentTime % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
};