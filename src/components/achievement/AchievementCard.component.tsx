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
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-lg"
    >
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500" />
      <div className="p-6">
        <div className="flex items-start gap-4">
          {achievement.icon_url ? (
            <img
              src={achievement.icon_url}
              alt={achievement.title}
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
              <span className="text-2xl">🏆</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{achievement.title}</h3>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-blue-50 text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
                {achievement.reward} {t('points')}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 overflow-hidden max-h-12">
              <RichTextDisplay 
                content={achievement.description || t('no_description')} 
                className="compact"
                maxLength={80}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(achievement)}
            className="px-3 py-1.5 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-sm font-medium transition-colors"
          >
            {t('edit')}
          </button>
          <button
            onClick={() => achievement._id && onDelete(achievement._id)}
            className="px-3 py-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AchievementCard