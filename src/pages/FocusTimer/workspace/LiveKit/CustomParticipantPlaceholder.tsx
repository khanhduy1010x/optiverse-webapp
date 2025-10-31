/**
 * Custom version of ParticipantPlaceholder — supports real avatar from metadata.
 * ✅ Giữ avatar cố định bằng useRef để tránh reload 304.
 * ✅ Fallback SVG nếu không có avatar.
 * ✅ Hiệu ứng nhẹ + lazy load cho performance.
 */
import * as React from 'react';
import type { SVGProps } from 'react';
import { useMaybeParticipantContext } from '@livekit/components-react';

const CustomParticipantPlaceholder = (props: SVGProps<SVGSVGElement>) => {
    const participant = useMaybeParticipantContext();

    // Parse metadata (chỉ khi đổi thật sự)
    const meta = React.useMemo(() => {
        try {
            if (!participant?.metadata) return {};
            return JSON.parse(participant.metadata);
        } catch {
            return {};
        }
    }, [participant?.metadata]);

    // Giữ avatar URL cố định (tránh reload liên tục)
    const avatarUrlRef = React.useRef<string>(meta.avatarUrl || '/default-avatar.png');
    const [avatarSrc, setAvatarSrc] = React.useState<string>(avatarUrlRef.current);

    // Nếu metadata đổi, chỉ cập nhật khi thật sự khác
    React.useEffect(() => {
        if (meta.avatarUrl && meta.avatarUrl !== avatarUrlRef.current) {
            avatarUrlRef.current = meta.avatarUrl;
            setAvatarSrc(meta.avatarUrl);
        }
    }, [meta.avatarUrl]);

    const displayName =
        meta.displayName || participant?.name || participant?.identity || 'Participant';

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)',
            }}
        >
            {avatarSrc ? (
                <div
                    style={{
                        width: '25%',
                        aspectRatio: '1 / 1',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.25)',
                        boxShadow: '0 0 10px rgba(255,255,255,0.1)',
                    }}
                >
                    <img
                        src={avatarSrc}
                        alt={displayName}
                        loading="lazy"
                        decoding="async"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'brightness(0.9)',
                            display: 'block',
                        }}
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== window.location.origin + '/default-avatar.png') {
                                img.src = '/default-avatar.png';
                            }
                        }}
                    />
                </div>
            ) : (
                <svg
                    width={320}
                    height={320}
                    viewBox="0 0 320 320"
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    {...props}
                >
                    <path
                        d="M160 180C204.182 180 240 144.183 240 100C240 55.8172 204.182 20 160 20C115.817 20 79.9997 55.8172 79.9997 100C79.9997 144.183 115.817 180 160 180Z"
                        fill="white"
                        fillOpacity={0.25}
                    />
                    <path
                        d="M97.6542 194.614C103.267 191.818 109.841 192.481 115.519 195.141C129.025 201.466 144.1 205 159.999 205C175.899 205 190.973 201.466 204.48 195.141C210.158 192.481 216.732 191.818 222.345 194.614C262.703 214.719 291.985 253.736 298.591 300.062C300.15 310.997 291.045 320 280 320H39.9997C28.954 320 19.8495 310.997 21.4087 300.062C28.014 253.736 57.2966 214.72 97.6542 194.614Z"
                        fill="white"
                        fillOpacity={0.25}
                    />
                </svg>
            )}
        </div>
    );
};

export default React.memo(CustomParticipantPlaceholder, (prev, next) => {
    const prevMeta = prev?.participant?.metadata;
    const nextMeta = next?.participant?.metadata;
    return prevMeta === nextMeta;
});
