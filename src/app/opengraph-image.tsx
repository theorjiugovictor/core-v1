import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CORE | Intelligent Business Control'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    // We'll create a nice card layout instead of just stretching the logo
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #1e293b, #0f172a)', // Slate-800 to Slate-900
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        width: '200px',
                        height: '200px',
                        marginBottom: '40px',
                        boxShadow: '0 0 50px rgba(79, 70, 229, 0.3)', // Indigo glow
                    }}
                >
                    {/* Centered Hexagon Representation (since we can't easily load local png in edge without full URL) 
              We'll use a stylized SVG/CSS representation of the Core concept for the preview 
              OR we try to load the arraybuffer of the png. 
              Let's try to fetch the image. If that fails, we fallback to CSS shapes.
          */}
                    {/* Fallback visual: Glowing Core */}
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #9333ea)', // Indigo to Purple
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '4px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'white',
                                boxShadow: '0 0 20px rgba(255,255,255,0.8)'
                            }}
                        />
                    </div>
                </div>

                <div style={{ fontSize: 60, fontWeight: 'bold', letterSpacing: '-0.05em', color: '#fff' }}>
                    CORE
                </div>
                <div style={{ fontSize: 30, color: '#94a3b8', marginTop: '10px' }}>
                    Intelligent Business Control
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
