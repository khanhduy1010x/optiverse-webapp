import * as React from 'react';
import { Track, type Participant } from 'livekit-client';
import type {
    ParticipantClickEvent,
    TrackReferenceOrPlaceholder,
} from '@livekit/components-core';
import {
    isTrackReference,
    isTrackReferencePinned,
} from '@livekit/components-core';

import {
    ConnectionQualityIndicator,
    ParticipantName,
    TrackMutedIndicator,
    FocusToggle,
    VideoTrack,
    AudioTrack,
    useParticipantTile,
    useIsEncrypted,
    ParticipantContext,
    TrackRefContext,
    useEnsureTrackRef,
    useFeatureContext,
    useMaybeLayoutContext,
    useMaybeParticipantContext,
    useMaybeTrackRefContext,
} from '@livekit/components-react';

import { LockLockedIcon, ScreenShareIcon } from '@livekit/components-react';

// 🧩 Custom placeholder của bạn (avatar, v.v.)
import CustomParticipantPlaceholder from './CustomParticipantPlaceholder';
/**
 * The `ParticipantContextIfNeeded` component only creates a `ParticipantContext`
 * if there is no `ParticipantContext` already.
 */
export function ParticipantContextIfNeeded(
    props: React.PropsWithChildren<{ participant?: Participant }>,
) {
    const hasContext = !!useMaybeParticipantContext();
    return props.participant && !hasContext ? (
        <ParticipantContext.Provider value={props.participant}>
            {props.children}
        </ParticipantContext.Provider>
    ) : (
        <>{props.children}</>
    );
}

/**
 * Only create a `TrackRefContext` if there is no `TrackRefContext` already.
 */
export function TrackRefContextIfNeeded(
    props: React.PropsWithChildren<{ trackRef?: TrackReferenceOrPlaceholder }>,
) {
    const hasContext = !!useMaybeTrackRefContext();
    return props.trackRef && !hasContext ? (
        <TrackRefContext.Provider value={props.trackRef}>
            {props.children}
        </TrackRefContext.Provider>
    ) : (
        <>{props.children}</>
    );
}

/** @public */
export interface ParticipantTileProps
    extends React.HTMLAttributes<HTMLDivElement> {
    /** The track reference to display. */
    trackRef?: TrackReferenceOrPlaceholder;
    disableSpeakingIndicator?: boolean;
    onParticipantClick?: (event: ParticipantClickEvent) => void;
}

/**
 * The `ParticipantTile` component is the base utility wrapper for displaying a visual representation of a participant.
 */
export const ParticipantTile = React.forwardRef<
    HTMLDivElement,
    ParticipantTileProps
>(function ParticipantTile(
    {
        trackRef,
        children,
        onParticipantClick,
        disableSpeakingIndicator,
        ...htmlProps
    }: ParticipantTileProps,
    ref,
) {
    const trackReference = useEnsureTrackRef(trackRef);
    const { elementProps } = useParticipantTile<HTMLDivElement>({
        htmlProps,
        disableSpeakingIndicator,
        onParticipantClick,
        trackRef: trackReference,
    });

    const isEncrypted = useIsEncrypted(trackReference.participant);
    const layoutContext = useMaybeLayoutContext();
    const autoManageSubscription = useFeatureContext()?.autoSubscription;

    const handleSubscribe = React.useCallback(
        (subscribed: boolean) => {
            if (
                trackReference.source &&
                !subscribed &&
                layoutContext &&
                layoutContext.pin.dispatch &&
                isTrackReferencePinned(trackReference, layoutContext.pin.state)
            ) {
                layoutContext.pin.dispatch({ msg: 'clear_pin' });
            }
        },
        [trackReference, layoutContext],
    );



    return (
        <div ref={ref} style={{ position: 'relative' }} {...elementProps}>
            <TrackRefContextIfNeeded trackRef={trackReference}>
                <ParticipantContextIfNeeded participant={trackReference.participant}>
                    {children ?? (
                        <>
                            {isTrackReference(trackReference) &&
                                (trackReference.publication?.kind === 'video' ||
                                    trackReference.source === Track.Source.Camera ||
                                    trackReference.source === Track.Source.ScreenShare) ? (
                                <VideoTrack
                                    trackRef={trackReference}
                                    onSubscriptionStatusChanged={handleSubscribe}
                                    manageSubscription={autoManageSubscription}
                                />
                            ) : (
                                isTrackReference(trackReference) && (
                                    <AudioTrack
                                        trackRef={trackReference}
                                        onSubscriptionStatusChanged={handleSubscribe}
                                    />
                                )
                            )}

                            <div className="lk-participant-placeholder">
                                <CustomParticipantPlaceholder />
                            </div>

                            <div className="lk-participant-metadata">
                                <div className="lk-participant-metadata-item">
                                    {trackReference.source === Track.Source.Camera ? (
                                        <>
                                            {isEncrypted && (
                                                <LockLockedIcon style={{ marginRight: '0.25rem' }} />
                                            )}
                                            <TrackMutedIndicator
                                                trackRef={{
                                                    participant: trackReference.participant,
                                                    source: Track.Source.Microphone,
                                                }}
                                                show="muted"
                                            />
                                            <ParticipantName />

                                            {/* 🟡 Parse metadata và render label */}
                                            {(() => {
                                                let meta: any = {};
                                                try {
                                                    meta = trackReference.participant.metadata
                                                        ? JSON.parse(trackReference.participant.metadata)
                                                        : {};
                                                } catch { }

                                                return (
                                                    <>
                                                        {meta.isOwner && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-500/40 text-yellow-300 bg-yellow-500/10 ml-1">
                                                                Host
                                                            </span>
                                                        )}
                                                        {!meta.isOwner && meta.isAdmin && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-300 bg-blue-500/10 ml-1">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <>
                                            <ScreenShareIcon style={{ marginRight: '0.25rem' }} />
                                            <ParticipantName>&apos;s screen</ParticipantName>
                                        </>
                                    )}

                                </div>

                                <ConnectionQualityIndicator className="lk-participant-metadata-item" />
                            </div>
                        </>
                    )}
                    <FocusToggle trackRef={trackReference} />
                </ParticipantContextIfNeeded>
            </TrackRefContextIfNeeded>
        </div>
    );
});
