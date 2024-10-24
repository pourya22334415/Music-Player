import './mockIndexedDB';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TrackController from '../src/controller/controller';
import { MockTrackModel, MockTrackView } from './mocks';
import { RepeatMode } from '../src/model/track';


describe('TrackController', () => {
    let mockModel: MockTrackModel;
    let mockView: MockTrackView;
    let controller: TrackController;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = "app";
        document.body.appendChild(container)

        mockModel = new MockTrackModel();
        mockView = new MockTrackView(container, null);

        controller = new TrackController();
        controller['model'] = mockModel;
        controller['view'] = mockView;
    });

    it('should toggle play/pause', () => {

        // --- play test ---
        mockModel.IsTrackPlaying = vi.fn().mockReturnValue(false); // paused
        controller['togglePlayPause']();

        expect(mockModel.playTrack).toHaveBeenCalled();
        expect(mockView.render).toHaveBeenCalled();

        // --- pause test ---
        mockModel.IsTrackPlaying = vi.fn().mockReturnValue(true); // playing
        controller['togglePlayPause']();

        expect(mockModel.pauseTrack).toHaveBeenCalled();
        expect(mockView.render).toHaveBeenCalled();
    });

    it('should go to the next track', () => {
        controller['nextTrack']();

        expect(mockModel.stopTrack).toHaveBeenCalled();
        expect(mockModel.nextTrack).toHaveBeenCalled();
        expect(mockModel.playTrack).toHaveBeenCalled();
        expect(mockView.render).toHaveBeenCalled();
    });

    it('should go to the previous track', () => {
        controller['prevTrack']();
        
        expect(mockModel.stopTrack).toHaveBeenCalled();
        expect(mockModel.prevTrack).toHaveBeenCalled();
        expect(mockModel.playTrack).toHaveBeenCalled();
        expect(mockView.render).toHaveBeenCalled();
    });

    it('should toggle shuffle', () => {
        mockModel.IsTrackListShuffle = vi.fn().mockReturnValue(false); // shuffle off
        controller['toggleShuffle']();

        expect(mockModel.setShuffle).toHaveBeenCalledWith(true);
        expect(mockView.render).toHaveBeenCalled();

        mockModel.IsTrackListShuffle = vi.fn().mockReturnValue(true); // shuffled on
        controller['toggleShuffle']();

        expect(mockModel.setShuffle).toHaveBeenCalledWith(false);
        expect(mockView.render).toHaveBeenCalled();
    });

    it('should toggle repeat mode', () => {
        mockModel.setRepeatMode(RepeatMode.OFF);
        controller['toggleRepeatMode']();

        expect(mockModel.setRepeatMode).toHaveBeenCalledWith(RepeatMode.REPEAT);
        expect(mockView.render).toHaveBeenCalled();

        mockModel.setRepeatMode(RepeatMode.REPEAT);
        controller['toggleRepeatMode']();

        expect(mockModel.setRepeatMode).toHaveBeenCalledWith(RepeatMode.OFF);
        expect(mockView.render).toHaveBeenCalled();
    });
});

