import React from 'react'
import { Achievement } from '../../types/achievement/achievement.types'
import { motion } from 'framer-motion'
import RichTextDisplay from '../common/RichTextDisplay.component'
import '../common/RichTextDisplay.style.css'
import { useAppTranslate } from '../../hooks/useAppTranslate'

interface AchievementCardProps {
  achievement: Achievement
  onEdit: (achievement: Achievement) => void
  onDelete: (id: string) => void
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onEdit, onDelete }) => {
  const { t } = useAppTranslate('achievement')
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-gray-50/30 backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.6)',
      }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative p-4">
        <div className="flex gap-4">
          {/* Left: Icon */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16">
              {achievement.icon_url ? (
                <img
                  src={achievement.icon_url}
                  alt={achievement.title}
                  className="w-full h-full rounded-xl object-cover shadow-md ring-1 ring-white/50 group-hover:shadow-lg transition-shadow duration-300"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-md ring-1 ring-white/50 group-hover:shadow-lg transition-all duration-300">
                  <span className="text-3xl">🏆</span>
                </div>
              )}
              {/* Reward badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-lg ring-2 ring-white">
                +{achievement.reward}
              </div>
            </div>
          </div>

          {/* Middle: Title & Description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight mb-1 line-clamp-2">
              {achievement.title}
            </h3>
            <div className="text-xs text-gray-600 leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
              <RichTextDisplay 
                content={achievement.description || t('no_description')} 
                className="compact"
              />
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(achievement)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 transition-all duration-200 backdrop-blur-sm whitespace-nowrap"
            >
              ✏️ {t('edit')}
            </button>
            <button
              onClick={() => achievement._id && onDelete(achievement._id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100 transition-all duration-200 backdrop-blur-sm whitespace-nowrap"
            >
              🗑️ {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AchievementCard