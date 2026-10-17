import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

export type JaliscoIllustrationProps = {
  /** dimensiones del SVG dentro de su contenedor */
  width?: number | string;
  height?: number | string;
};

/**
 * Ilustración de heritage de Jalisco (sol, sierra, catedral, agave, sombrero y
 * barril) usada en el hero del login.
 *
 * Adaptada del diseño editorial: los verdes/azules del agave del diseño se
 * cambiaron por la familia cyan de la marca. `react-native-svg` no tiene
 * interop de NativeWind, así que el tamaño va por props, no por clases.
 */
export function JaliscoIllustration({ width = "100%", height = "100%" }: JaliscoIllustrationProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 400 130"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Sol sobre la sierra */}
      <Circle cx={200} cy={55} r={28} fill="#f59e0b" fillOpacity={0.35} />
      <Circle cx={200} cy={55} r={18} fill="#fbbf24" fillOpacity={0.55} />

      {/* Sierra (dos capas) */}
      <Path
        d="M0 100L55 60L125 90L210 40L290 85L360 45L400 70V130H0V100Z"
        fill="#09212c"
        fillOpacity={0.85}
      />
      <Path
        d="M60 110L140 75L230 105L310 65L400 95V130H60V110Z"
        fill="#0e3240"
        fillOpacity={0.9}
      />

      {/* Torres de la catedral */}
      <G fillOpacity={0.8}>
        <Path d="M172 130V65L178 30L184 65V130H172Z" fill="#d97706" />
        <Path d="M216 130V65L222 30L228 65V130H216Z" fill="#d97706" />
      </G>
      <Path d="M184 80H216V130H184V80Z" fill="#b45309" fillOpacity={0.75} />
      <Circle cx={200} cy={92} r={6} fill="#fde68a" fillOpacity={0.9} />

      {/* Agave izquierdo */}
      <G>
        <Path d="M35 130C32 105 20 95 10 90C28 100 35 112 35 130Z" fill="#00bbf9" />
        <Path d="M38 130C38 100 32 80 25 72C40 85 45 108 45 130H38Z" fill="#38bdf8" />
        <Path d="M47 130C52 102 62 82 74 75C64 90 56 112 55 130H47Z" fill="#00bbf9" />
        <Path d="M42 130C44 95 48 70 50 58C52 70 54 98 52 130H42Z" fill="#7dd3fc" />
      </G>

      {/* Agave derecho */}
      <G>
        <Path d="M350 130C348 108 340 92 328 85C342 94 348 112 350 130Z" fill="#00bbf9" />
        <Path d="M356 130C358 100 365 78 376 68C368 85 362 108 360 130H356Z" fill="#38bdf8" />
        <Path d="M352 130C353 96 354 75 357 60C359 75 359 100 356 130H352Z" fill="#7dd3fc" />
      </G>

      {/* Sombrero de mariachi */}
      <Ellipse cx={295} cy={116} rx={24} ry={7} fill="#d96b43" fillOpacity={0.85} />
      <Path d="M285 116C285 106 290 102 295 102C300 102 305 106 305 116H285Z" fill="#c2410c" />
      <Line x1={272} y1={116} x2={318} y2={116} stroke="#fcd34d" strokeWidth={1.5} />

      {/* Barril de tequila */}
      <Rect x={95} y={106} width={18} height={22} rx={3} fill="#b45309" />
      <Line x1={95} y1={111} x2={113} y2={111} stroke="#fcd34d" strokeWidth={1.5} />
      <Line x1={95} y1={122} x2={113} y2={122} stroke="#fcd34d" strokeWidth={1.5} />
    </Svg>
  );
}