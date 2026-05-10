import { useState } from 'react'
import PropTypes from 'prop-types'

const PLAYER_COLORS = [
  { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
  { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500' },
  { name: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500' },
]

export default function SettingsModal({ isOpen, onClose, settings, onSave, players }) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [localPlayers, setLocalPlayers] = useState(players)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(localSettings, localPlayers)
    onClose()
  }

  const updatePlayerName = (index, name) => {
    const newPlayers = [...localPlayers]
    newPlayers[index] = { ...newPlayers[index], name }
    setLocalPlayers(newPlayers)
  }

  const toggleAI = (index) => {
    const newPlayers = [...localPlayers]
    newPlayers[index] = { ...newPlayers[index], isAI: !newPlayers[index].isAI }
    setLocalPlayers(newPlayers)
  }

  SettingsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    players: PropTypes.array.isRequired,
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">⚙️ Pengaturan</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">👥 Pemain</h3>
            {localPlayers.map((player, index) => (
              <div key={index} className="flex items-center gap-2 mb-3 p-2 bg-slate-600/50 rounded-lg">
                <div className={`w-8 h-8 rounded-full ${PLAYER_COLORS.find(c => c.name === player.color)?.bg || 'bg-blue-500'}`}></div>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                  placeholder={`Pemain ${index + 1}`}
                />
                <button
                  onClick={() => toggleAI(index)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    player.isAI
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-600 text-white/60'
                  }`}
                >
                  🤖 AI
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">🔊 Suara</h3>
            <div className="flex items-center justify-between">
              <span className="text-white">Aktifkan efek suara</span>
              <button
                onClick={() => setLocalSettings({ ...localSettings, soundEnabled: !localSettings.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-all ${
                  localSettings.soundEnabled ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">🎨 Tampilan</h3>
            <div className="flex items-center justify-between">
              <span className="text-white">Animasi aktif</span>
              <button
                onClick={() => setLocalSettings({ ...localSettings, animationsEnabled: !localSettings.animationsEnabled })}
                className={`w-12 h-6 rounded-full transition-all ${
                  localSettings.animationsEnabled ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  localSettings.animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-bold transition-all"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}