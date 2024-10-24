import { vi } from "vitest";
import TrackModel, { RepeatMode } from "../src/model/track";
import TrackView from "../src/view/view";

export class MockTrackModel extends TrackModel {
    constructor() {
        super();
        this.getTracks = vi.fn().mockReturnValue([]);
        this.getCurrentTrack = vi.fn().mockReturnValue(null);
        this.IsTrackListShuffle = vi.fn().mockReturnValue(false);
        this.getRepeatMode = vi.fn().mockReturnValue(RepeatMode.OFF);
        this.IsTrackPlaying = vi.fn().mockReturnValue(false);
        this.getAudioElement = vi.fn().mockReturnValue(null);
        this.setRepeatMode = vi.fn();
        this.setShuffle = vi.fn();
        this.playTrack = vi.fn();
        this.pauseTrack = vi.fn();
        this.stopTrack = vi.fn();
        this.nextTrack = vi.fn();
        this.prevTrack = vi.fn();
        this.selectTrack = vi.fn();
    }
}

export class MockTrackView extends TrackView {
    constructor(container: HTMLElement, audioElement: HTMLAudioElement | null) {
        super(container, audioElement);
        this.render = vi.fn();
        this.onPlayPauseButtonClick = vi.fn();
        this.onNextTrackButtonClick = vi.fn();
        this.onPrevTrackButtonClick = vi.fn();
        this.onToggleShuffleButtonClick = vi.fn();
        this.onToggleRepeatButtonClick = vi.fn();
        this.onSelectTrackItem = vi.fn();
        this.onEndedTrack = vi.fn();
        this.onProgressBarInput = vi.fn();
    }
}
