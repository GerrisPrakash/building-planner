import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <canvas id="canvas" style= {{backgroundColor: "blue"}} width={window.innerWidth} height={window.innerHeight}>canvas</canvas>
  )
}

export default App
