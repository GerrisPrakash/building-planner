import { useLayoutEffect, useState } from 'react'
import './App.css'
import rough from "roughjs"
import { RoughGenerator } from 'roughjs/bin/generator';
const generator = rough.generator()

function createElement(x1, y1, x2, y2, type) {
  let roughElement=null
  switch(type) {
    case 'line':
      roughElement = generator.line(x1, y1, x2, y2, {roughness: 0});
      break;
    case 'rectangle':
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {roughness: 0});
      break;
    case 'circle':
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      roughElement = generator.circle(x1, y1, radius, {roughness: 0});
      break;
    default:
      roughElement = generator.line(x1, y1, x2, y2, {roughness: 0});
}
  
  return { x1, y1, x2, y2, roughElement }
}

function App() {

  const [elements, setElement] = useState([])
  const [drawing, setdrawing] = useState(false)
  const [shape, setShape] = useState('line')

  const handleMouseDown = (event) => {
    setdrawing(true)
    const { clientX, clientY } = event
    const element = createElement(clientX, clientY, clientX, clientY, shape)
    setElement(prevState => [...prevState, element])
  }

  const handlemouseMove = (event) => {
    if (!drawing) {
      return;
    }
    const { clientX, clientY } = event
    const index = elements.length - 1
    const { x1, y1 } = elements[index]
    const updatedElement = createElement(x1, y1, clientX, clientY, shape)
    const elementsCopy = [...elements]
    elementsCopy[index] = updatedElement
    setElement(elementsCopy)

  }

  const handleMouseUp = () => {
    setdrawing(false)
  }
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext("2d");
    ctx.clearRect(0, 0, canvas?.clientWidth, canvas?.clientHeight)
    const roughCanvas = rough.canvas(canvas)
    elements.forEach(({ roughElement }) => {
      roughCanvas.draw(roughElement)
    })
    // const rect = generator.rectangle(10, 10, 100, 100)
    // roughCanvas.draw(rect)

  })
  return (
    <div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight-100}
        onMouseDown={handleMouseDown}
        onMouseMove={handlemouseMove}
        onMouseUp={handleMouseUp}
      >
        canvas
      </canvas>
      <div className='tools'>
        <button onClick={() => {
          setShape('line')
        }} className='tool'>Line</button>
        <button onClick={() => {
          setShape('rectangle')
        }}  className='tool'>Rectangle</button>
        <button onClick={() => {
          setShape('circle')
        }} className='tool'>Circle</button>
      </div>
    </div>
  )
}

export default App
