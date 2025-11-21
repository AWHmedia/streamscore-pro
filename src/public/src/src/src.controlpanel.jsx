jsximport React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io() // Vercel auto-detects the server

const sportPresets = {
  volleyball: { periodLabel: "Set", periods: ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"], clock: "25 pts" },
  basketball: { periodLabel: "Quarter", periods: ["1st Q", "2nd Q", "3rd Q", "4th Q", "OT"], clock: "12:00" },
  football: { periodLabel: "Quarter", periods: ["1st Q", "2nd Q", "3rd Q", "4th Q", "OT"], clock: "15:00" },
  baseball: { periodLabel: "Inning", periods: ["Top 1", "Bot 1", "Top 2", "Bot 2", "Top 3", "Bot 3", "Top 4", "Bot 4", "Top 5", "Bot 5", "Top 6", "Bot 6", "Top 7", "Bot 7", "Top 8", "Bot 8", "Top 9", "Bot 9", "Extra"], clock: "∞" }
}

export default function ControlPanel() {
  const [state, setState] = useState({
    sport: "volleyball",
    homeTeam: "Home", awayTeam: "Away",
    homeScore: 0, awayScore: 0,
    homeColor: "#ff3333", awayColor: "#3333ff",
    homeLogo: "", awayLogo: "",
    period: "Set 1",
    clock: "25 pts"
  })

  useEffect(() => {
    socket.on('stateUpdate', (newState) => setState(newState))
    return () => socket.off('stateUpdate')
  }, [])

  const update = (updates) => {
    const newState = { ...state, ...updates }
    setState(newState)
    socket.emit('updateState', newState)
  }

  const setSport = (sport) => {
    const preset = sportPresets[sport]
    update({ sport, period: preset.periods[0], clock: preset.clock })
  }

  const handleLogo = (e, side) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => update({ [side + 'Logo']: ev.target.result })
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 md:p-8">
      <h1 className="text-5xl md:text-6xl font-black text-center text-white mb-8 tracking-tight">StreamScore Pro</h1>

      {/* Sport Selector */}
      <div className="max-w-4xl mx-auto flex justify-center gap-4 mb-8 flex-wrap">
        {Object.keys(sportPresets).map(s => (
          <button key={s} onClick={() => setSport(s)}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${state.sport === s ? 'bg-white text-black scale-110' : 'bg-white/20 text-white hover:bg-white/40'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Home Team */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-4">{state.homeTeam || "Home Team"}</h2>
          <input className="w-full p-4 rounded-xl text-black text-xl" placeholder="Team name"
            value={state.homeTeam} onChange={e => update({homeTeam: e.target.value})} />
          <input type="color" value={state.homeColor} onChange={e => update({homeColor: e.target.value})}
            className="w-24 h-16 mt-4 rounded cursor-pointer" />
          <label className="block mt-4 cursor-pointer">
            <div className="bg-white/20 hover:bg-white/30 rounded-xl p-8 text-center border-2 border-dashed border-white/50">
              {state.homeLogo ? <img src={state.homeLogo} alt="Home logo" className="max-h-32 mx-auto" /> : "📷 Upload Logo"}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogo(e, 'home')} />
          </label>
        </div>

        {/* Away Team */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-4">{state.awayTeam || "Away Team"}</h2>
          <input className="w-full p-4 rounded-xl text-black text-xl" placeholder="Team name"
            value={state.awayTeam} onChange={e => update({awayTeam: e.target.value})} />
          <input type="color" value={state.awayColor} onChange={e => update({awayColor: e.target.value})}
            className="w-24 h-16 mt-4 rounded cursor-pointer" />
          <label className="block mt-4 cursor-pointer">
            <div className="bg-white/20 hover:bg-white/30 rounded-xl p-8 text-center border-2 border-dashed border-white/50">
              {state.awayLogo ? <img src={state.awayLogo} alt="Away logo" className="max-h-32 mx-auto" /> : "📷 Upload Logo"}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogo(e, 'away')} />
          </label>
        </div>

        {/* Score Controls */}
        <div className="md:col-span-2 bg-black/50 backdrop-blur-xl rounded-3xl p-8 text-center">
          <div className="flex justify-center items-center gap-16 text-9xl font-black">
            <button onClick={() => update({homeScore: state.homeScore + 1})}
              className="bg-green-600 hover:bg-green-500 w-32 h-32 rounded-full text-7xl">+</button>
            <span>{state.homeScore} - {state.awayScore}</span>
            <button onClick={() => update({awayScore: state.awayScore + 1})}
              className="bg-green-600 hover:bg-green-500 w-32 h-32 rounded-full text-7xl">+</button>
          </div>
          <div className="flex justify-center gap-8 mt-8">
            <button onClick={() => update({homeScore: Math.max(0, state.homeScore - 1)})}
              className="bg-red-600 hover:bg-red-500 px-12 py-6 rounded-xl text-4xl">−1</button>
            <button onClick={() => update({awayScore: Math.max(0, state.awayScore - 1)})}
              className="bg-red-600 hover:bg-red-500 px-12 py-6 rounded-xl text-4xl">−1</button>
          </div>
        </div>

        {/* Period + Clock */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8">
            <label className="text-xl opacity-80">Period / Inning / Set</label>
            <input className="w-full p-4 mt-2 rounded-xl text-black text-2xl" 
              value={state.period} onChange={e => update({period: e.target.value})} />
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8">
            <label className="text-xl opacity-80">Clock (manual for now)</label>
            <input className="w-full p-4 mt-2 rounded-xl text-black text-2xl text-center" 
              value={state.clock} onChange={e => update({clock: e.target.value})} placeholder="Future auto countdown here" />
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-2xl mb-4">OBS Browser Source URL (transparent background):</p>
        <code className="bg-black/70 px-8 py-4 rounded-2xl text-3xl break-all">
          {window.location.origin}/overlay
        </code>
      </div>
    </div>
  )
}
Replace src/Overlay.jsx with this gorgeous new version:
jsximport React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io()

export default function Overlay() {
  const [state, setState] = useState({
    homeTeam: "Home", awayTeam: "Away",
    homeScore: 0, awayScore: 0,
    homeColor: "#ff3333", awayColor: "#3333ff",
    homeLogo: "", awayLogo: "",
    period: "Set 1", clock: "25 pts"
  })

  useEffect(() => {
    socket.on('stateUpdate', setState)
    return () => socket.off('stateUpdate')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
      <div className="bg-gradient-to-br from-black/90 via-black/70 to-black/90 backdrop-blur-2xl rounded-3xl p-10 shadow-5xl border-8 border-white/30 max-w-7xl">
        <div className="grid grid-cols-3 items-center gap-12">
          {/* Home */}
          <div className="text-right">
            {state.homeLogo && <img src={state.homeLogo} alt="" className="h-32 mx-auto mb-4 object-contain" />}
            <h2 className="text-8xl font-black drop-shadow-2xl" style={{ color: state.homeColor }}>
              {state.homeTeam}
            </h2>
          </div>

          {/* Center Score */}
          <div className="text-center">
            <div className="text-9xl md:text-[180px] font-black leading-none">
              {state.homeScore}<span className="text-7xl md:text-9xl mx-4">–</span>{state.awayScore}
            </div>
            <div className="text-5xl mt-6 font-bold opacity-90">
              {state.period} • {state.clock}
            </div>
          </div>

          {/* Away */}
          <div className="text-left">
            {state.awayLogo && <img src={state.awayLogo} alt="" className="h-32 mx-auto mb-4 object-contain" />}
            <h2 className="text-8xl font-black drop-shadow-2xl" style={{ color: state.awayColor }}>
              {state.awayTeam}
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}
