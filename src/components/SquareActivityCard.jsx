/**
 * SquareActivityCard - Featured activity card with illustration
 *
 * Used in the "Featured for you" horizontal scroll section
 */

export default function SquareActivityCard({
  title,
  subtitle,
  duration,
  platform, // 'spotify', 'youtube', 'in-app'
  illustration,
  onClick,
  className = ''
}) {
  const platformConfig = {
    spotify: {
      label: 'Spotify',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    youtube: {
      label: 'YouTube',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    'in-app': {
      label: 'In-app',
      bgColor: 'bg-sage/10',
      textColor: 'text-sage'
    }
  }

  const config = platformConfig[platform] || platformConfig['in-app']

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-48 bg-white rounded-2xl border border-sand hover:border-sage hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden text-left cursor-pointer ${className}`}
    >
      {/* Illustration */}
      <div className="h-48 bg-gradient-to-br from-sage/10 to-terracotta/10 flex items-center justify-center overflow-hidden">
        {illustration ? (
          <img
            src={illustration}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand/30">
            <span className="text-earth-light/30 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-earth font-medium text-sm mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-earth-light text-xs mb-3 line-clamp-2">
          {subtitle}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between">
          <span className="text-earth-light text-xs">
            {duration}
          </span>
          <span className={`text-[10px] px-2 py-1 rounded-full ${config.bgColor} ${config.textColor} font-medium`}>
            {config.label}
          </span>
        </div>
      </div>
    </button>
  )
}
