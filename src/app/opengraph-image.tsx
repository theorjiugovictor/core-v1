import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CORE | You sell. We handle the rest.'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #1E2A6B, #101322)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '4px',
                        marginBottom: '40px',
                    }}
                >
                    <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.82, color: '#fff' }}>
                        CORE
                    </div>
                    {/* Brand dot — square, cowrie */}
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: '#FFC53D',
                            marginBottom: '4px',
                        }}
                    />
                </div>
                <div style={{ fontSize: 30, color: '#F5F6F8', opacity: 0.7, marginTop: '10px' }}>
                    You sell. We handle the rest.
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
