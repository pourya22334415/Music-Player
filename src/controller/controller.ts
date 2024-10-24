import TrackModel, { RepeatMode } from "../model/track";
import TrackView from "../view/view";

export default class TrackController {

    private model: TrackModel;
    private view: TrackView;

    constructor() {
        const appElement = document.getElementById("app") as HTMLElement;
        
        this.model = new TrackModel();
        this.view = new TrackView(
            appElement, this.model.getAudioElement()
        );

        this.onViewChange();

        this.view.onPlayPauseButtonClick = this.togglePlayPause.bind(this);
        this.view.onNextTrackButtonClick = this.nextTrack.bind(this);
        this.view.onPrevTrackButtonClick = this.prevTrack.bind(this);
        this.view.onToggleShuffleButtonClick = this.toggleShuffle.bind(this);
        this.view.onToggleRepeatButtonClick = this.toggleRepeatMode.bind(this);
        this.view.onSelectTrackItem = this.selectTrackItem.bind(this);
        this.view.onEndedTrack = this.endedTrackRefresh.bind(this);
        this.view.onProgressBarInput = this.ProgressBarInput.bind(this);
    }

    onViewChange(): void {
        this.view.render(
            this.model.getTracks(),
            this.model.getCurrentTrack(),
            this.model.IsTrackListShuffle(),
            this.model.getRepeatMode(),
            this.model.IsTrackPlaying(),
            this.model.getAudioElement(),
            this.model.getCurrentTrack()?.id
        );        
    }

    private toggleShuffle(): void {
        this.model.setShuffle(!this.model.IsTrackListShuffle());

        this.onViewChange();
    }

    private toggleRepeatMode(): void {
        if (this.model.getRepeatMode() === RepeatMode.REPEAT) {
            this.model.setRepeatMode(RepeatMode.OFF);
        } else {
            this.model.setRepeatMode(RepeatMode.REPEAT);
        }

        this.onViewChange();
    }

    private endedTrackRefresh(): void {
        this.onViewChange();
    }

    private togglePlayPause(): void {
        if (this.model.IsTrackPlaying()) {
            this.model.pauseTrack();
        } else {
            this.model.playTrack(false);
        }

        this.onViewChange();
    }

    private nextTrack(): void {
        this.model.stopTrack();
        this.model.nextTrack();
        this.model.playTrack();

        this.onViewChange();
    }

    private prevTrack(): void {
        this.model.stopTrack();
        this.model.prevTrack();
        this.model.playTrack();

        this.onViewChange();
    }
    
    private selectTrackItem(trackId: number): void {     
        this.model.stopTrack();
        this.model.selectTrack(trackId);
        this.model.playTrack();

        this.onViewChange();
    }

    private ProgressBarInput(event: Event, audio: HTMLAudioElement): void {
        const target = event.target as HTMLInputElement;
        audio.currentTime = parseFloat(target.value);

        if (!this.model.IsTrackPlaying()) {
            this.togglePlayPause();
        }
    }
}
