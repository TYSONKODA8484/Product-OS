interface AppLogoProps { name: string }

const APP_COLORS: Record<string, [string, string]> = {
  LightX: ['#378ADD', '#185FA5'],
  'AI Leap': ['#1D9E75', '#176A51'],
  Photocut: ['#BA7517', '#8C5810'],
  StyleOn: ['#9B5DE5', '#6D3CB3'],
  StorYZ: ['#E15D7E', '#B43A5C'],
  Photoshoot: ['#378ADD', '#185FA5'],
}

export const AppLogo = ({ name }: AppLogoProps) => {
  const [a, b] = APP_COLORS[name] || ['#444441', '#222220']
  const initials = name.split(/[\s-]/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="applogo" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {initials}
    </div>
  )
}
