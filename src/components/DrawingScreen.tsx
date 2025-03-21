import { useLayoutEffect, useState } from 'react'
import '../App.css'
import rough from "roughjs"
import Select from 'react-select';

const DrawingScreen = () => {
  const generator = rough.generator()
  const [elements, setElement] = useState([])
  // const [drawing, setdrawing] = useState(false)
  const [shape, setShape] = useState('')
  const [action, setAction] = useState("none")
  const [selectedElement, setSelectedelement] = useState(null)
  const [detetedList, setDeletedList] = useState([])

  const createElement = (id, x1, y1, x2, y2, type) => {
    let roughElement = null
    switch (type) {
      case 'line':
        roughElement = generator.line(x1, y1, x2, y2, { roughness: 0 });
        break;
      case 'rectangle':
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, { roughness: 0 });
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        roughElement = generator.circle(x1, y1, radius * 2, { roughness: 0 });
        break;
      default:
        return
    }

    return { id, x1, y1, x2, y2, type, roughElement }
  }

  const updateElement = (id, x1, y1, x2, y2, type) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);

    const elementCopy = [...elements];
    elementCopy[id] = updatedElement
    setElement(elementCopy)
  }

  const isWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element;
    if (type === 'rectangle' || type === 'circle') {
      const minX = Math.min(x1, x2)
      const maxX = Math.max(x1, x2)
      const minY = Math.min(y1, y2)
      const maxY = Math.max(y1, y2)
      return x >= minX && x <= maxX && y >= minY && y <= maxY
    } else {
      return false
    }
  }
  const getElementOnCursor = (x, y, elements) => {
    return elements.find(element => isWithinElement(x, y, element))
  }

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event
    if (shape == 'moving') {
      const element = getElementOnCursor(clientX, clientY, elements)
      if (element) {
        setSelectedelement(element)
        setAction("moving")
      }
    } else {
      const id = elements.length
      const element = createElement(id, clientX, clientY, clientX, clientY, shape)
      setElement(prevState => [...prevState, element])
      setAction("drawing")
    }
  }

  const handlemouseMove = (event) => {
    // if (!drawing) {
    //   return;
    // }
    const { clientX, clientY } = event
    if (action === 'drawing') {
      const index = elements.length - 1
      const { x1, y1 } = elements[index]
      updateElement(index, x1, y1, clientX, clientY, shape)
    } else if (action === "moving") {
      const { id, x1, x2, y1,y2, type } = selectedElement
      const width = x2-x1
      const height = y2-y1
      updateElement(id, clientX, clientY, clientX+ width,clientX+height, type)
    }

  }

  const handleMouseUp = () => {
    setAction("none")
    setSelectedelement(null)
  }
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext("2d");
    ctx.clearRect(0, 0, canvas?.clientWidth, canvas?.clientHeight)
    const roughCanvas = rough.canvas(canvas)
    if (elements) {
      elements?.forEach(({ roughElement }) => {
        roughCanvas.draw(roughElement)
      })
    }

  })

  const shapesList = [
    { value: 'line', label: 'Line' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'moving', label: 'Move Elements' },
  ];
  const actionList = [

    { value: 'undo', label: 'Undo' },
    { value: 'redo', label: 'Redo' }
  ]
  const handleShapeChange = (selectedOption) => {
    setShape(selectedOption.value); // Set the shape value based on selection
  };
  const handleActionChange = (selectedOption) => {
    if (selectedOption.value === "move") {
      // setAction("moving")
    } else if (selectedOption.value === "undo" && elements.length > 0) {
      let elementsCopy = [...elements]
      setDeletedList(prevState => [...prevState, elementsCopy.pop()])
      setElement(elementsCopy)
    } else if (selectedOption.value === 'redo' && detetedList.length > 0) {
      let deletedCopy = [...detetedList]
      setElement(prevState => [...prevState, deletedCopy.pop()])
      setDeletedList(deletedCopy)
    }
  }
  const customStyles = {
    control: (styles) => ({
      ...styles,
      width: '150px',  // Set the desired width here
    }),
    menu: (styles) => ({
      ...styles,
      width: '150px',  // Ensure the menu width matches the control width
    })
  };
  return (
    <div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight - 100}
        onMouseDown={handleMouseDown}
        onMouseMove={handlemouseMove}
        onMouseUp={handleMouseUp}
      >
        canvas
      </canvas>

      <div className='tools'>
        <Select
          options={shapesList}
          onChange={handleShapeChange}
          placeholder="Draw tools"
          styles={customStyles}
          menuPlacement='top'
        />
        <Select
          options={actionList}
          onChange={handleActionChange}
          placeholder="Select Tool"
          styles={customStyles}
          menuPlacement='top'
        />
      </div>
    </div>
  )
}

export default DrawingScreen
