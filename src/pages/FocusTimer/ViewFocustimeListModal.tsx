import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

type FocusSession = {
  _id: string;
  start_time: string;
  end_time: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sessions: FocusSession[];
  date: string | null;
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ViewFocustimeListModal({ isOpen, onClose, sessions, date }: Props) {
  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-50 bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border"
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-blue-500" />
          <h2 className="text-xl font-bold">{formatDate(date)}</h2>
        </div>
        <ul className="list-unstyled space-y-3">
          {sessions.length === 0 ? (
            <li className="text-gray-400 flex flex-col items-center py-8">
              <Clock size={40} className="mb-2" />
              <span>No focus session for this day.</span>
            </li>
          ) : (
            sessions.map((s) => {
              const start = new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const duration = Math.floor(
                (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000
              );
              return (
                <li
                  key={s._id}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 shadow-sm hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-400" />
                    <span className="font-semibold text-gray-700">{start} - {end}</span>
                  </div>
                  <span className="text-sm text-gray-500">{duration} min</span>
                </li>
              );
            })
          )}
        </ul>
      </motion.div>
    </div>
  );
}