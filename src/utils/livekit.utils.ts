import { Participant, Track } from 'livekit-client';

/**
 * 🎤 Helper để lấy trạng thái mic của một participant
 * @param participant - LiveKit Participant object
 * @returns true nếu mic bật, false nếu tắt hoặc không có
 */
export function isMicrophoneEnabled(participant: Participant): boolean {
  try {
    // Lặp qua tất cả tracks để tìm Microphone track
    for (const pub of (participant as any).audioTracks) {
      if (!pub.isMuted) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('Error checking microphone status:', error);
    return false;
  }
}

/**
 * 📷 Helper để lấy trạng thái camera của một participant
 * @param participant - LiveKit Participant object
 * @returns true nếu camera bật, false nếu tắt hoặc không có
 */
export function isCameraEnabled(participant: Participant): boolean {
  try {
    // Lặp qua tất cả video tracks để tìm Camera track
    for (const pub of (participant as any).videoTracks) {
      if (!pub.isMuted && pub.source === Track.Source.Camera) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('Error checking camera status:', error);
    return false;
  }
}

/**
 * 🎤📷 Lấy toàn bộ thông tin media status của participant
 * @param participant - LiveKit Participant object
 * @returns object với {micEnabled, camEnabled, isSpeaking, name}
 */
export function getParticipantMediaStatus(participant: Participant) {
  return {
    name: participant.name || participant.identity,
    identity: participant.identity,
    micEnabled: isMicrophoneEnabled(participant),
    camEnabled: isCameraEnabled(participant),
    isSpeaking: participant.isSpeaking,
    isLocal: participant.isLocal,
  };
}

/**
 * 📋 Lấy danh sách tất cả participants với media status
 * @param participants - array của LiveKit Participants
 * @returns array của participant info với mic/cam status
 */
export function getParticipantsMediaInfo(participants: Participant[]) {
  return participants.map((p) => getParticipantMediaStatus(p));
}
