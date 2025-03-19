import { useLayoutEffect, useState } from 'react'
import './App.css'
import rough from "roughjs"
const generator = rough.generator()

function createElement(x1,y1, x2, y2) {
  const roughElement = generator.line(x1,y1, x2, y2) ;
  return { x1, y1, x2, y2, roughElement }
}

function App() {
  
  const [elements, setElement] = useState([])
  const [drawing, setdrawing] = useState(false)

  const handleMouseDown = (event) =>{
    setdrawing(true)
    const{clientX,clientY} = event
    const element = createElement(clientX, clientY, clientX, clientY)
    setElement(prevState => [...prevState, element])
  }

  const handlemouseMove = (event) =>{
    if(!drawing){
      return;
    }
    const{clientX,clientY} = event
    const index = elements.length-1
    const {x1, y1} = elements[index]
    const updatedElement = createElement(x1,y1, clientX,clientY)
    const elementsCopy = [...elements]
    elementsCopy[index] = updatedElement
    setElement(elementsCopy)

  }

  const handleMouseUp = () =>{
    setdrawing(false)
  }
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext("2d");
    ctx.clearRect(0,0,canvas?.clientWidth, canvas?.clientHeight)
    const roughCanvas = rough.canvas(canvas)
    elements.forEach(({roughElement})=>{
      roughCanvas.draw(roughElement)
    })
    // const rect = generator.rectangle(10, 10, 100, 100)
    // roughCanvas.draw(rect)

  })
  return (
    <canvas 
      id = "canvas" 
      width = {window.innerWidth} 
      height = {window.innerHeight}
      onMouseDown = {handleMouseDown}
      onMouseMove={handlemouseMove}
      onMouseUp ={handleMouseUp}
    >
      canvas
    </canvas>
  )
}

export default App
