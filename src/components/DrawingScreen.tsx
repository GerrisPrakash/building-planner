import { useLayoutEffect, useState, MouseEvent } from 'react';
import '../App.css';
import rough from 'roughjs';
import Select, { SingleValue } from 'react-select';

// Define types for the elements you are drawing
interface RoughElement {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'line' | 'rectangle' | 'circle' | 'moving';
  roughElement: any; // Type for roughjs element
}

const DrawingScreen = () => {
  const generator = rough.generator();
  
  const [elements, setElement] = useState<RoughElement[]>([]);
  const [shape, setShape] = useState<string>('');  // Shape can be line, rectangle, circle, or moving
  const [action, setAction] = useState<'none' | 'drawing' | 'moving'>('none');
  const [selectedElement, setSelectedelement] = useState<RoughElement | null>(null);
  const [detetedList, setDeletedList] = useState<RoughElement[]>([]);

  const createElement = (id: number, x1: number, y1: number, x2: number, y2: number, type: string): RoughElement => {
    let roughElement = null;
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
        roughElement = generator.line(x1, y1, x2, y2, { roughness: 0 });;
    }
    return { id, x1, y1, x2, y2, type, roughElement };
  };

  const updateElement = (id: number, x1: number, y1: number, x2: number, y2: number, type: string) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);
    if (updatedElement) {
      const elementCopy = [...elements];
      elementCopy[id] = updatedElement;
      setElement(elementCopy);
    }
  };

  const isWithinElement = (x: number, y: number, element: RoughElement): boolean => {
    const { type, x1, x2, y1, y2 } = element;
    if (type === 'rectangle' || type === 'circle') {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else {
      return false;
    }
  };

  const getElementOnCursor = (x: number, y: number, elements: RoughElement[]): RoughElement | undefined => {
    return elements.find(element => isWithinElement(x, y, element));
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;
    if (shape === 'moving') {
      const element = getElementOnCursor(clientX, clientY, elements);
      if (element) {
        setSelectedelement(element);
        setAction('moving');
      }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, shape);
      if (element) {
        setElement(prevState => [...prevState, element]);
        setAction('drawing');
      }
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;
    if (action === 'drawing' && elements.length > 0) {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, shape);
    } else if (action === 'moving' && selectedElement) {
      const { id, x1, x2, y1, y2, type } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      updateElement(id, clientX, clientY, clientX + width, clientY + height, type);
    }
  };

  const handleMouseUp = () => {
    setAction('none');
    setSelectedelement(null);
  };

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      const roughCanvas = rough.canvas(canvas);
      elements.forEach(({ roughElement }) => {
        roughCanvas.draw(roughElement);
      });
    }
  }, [elements]);

  const shapesList = [
    { value: 'line', label: 'Line' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'moving', label: 'Move Elements' },
  ];

  const actionList = [
    { value: 'undo', label: 'Undo' },
    { value: 'redo', label: 'Redo' },
  ];

  const handleShapeChange = (selectedOption: SingleValue<{ value: string; label: string }>) => {
    if (selectedOption) {
      setShape(selectedOption.value); // Set the shape value based on selection
    }
  };

  const handleActionChange = (selectedOption: SingleValue<{ value: string; label: string }>) => {
    if (selectedOption?.value === 'undo' && elements.length > 0) {
      const elementsCopy = [...elements];
      setDeletedList(prevState => [...prevState, elementsCopy.pop()!]);
      setElement(elementsCopy);
    } else if (selectedOption?.value === 'redo' && detetedList.length > 0) {
      const deletedCopy = [...detetedList];
      setElement(prevState => [...prevState, deletedCopy.pop()!]);
      setDeletedList(deletedCopy);
    }
  };

  const customStyles = {
    control: (styles: any) => ({
      ...styles,
      width: '150px',  // Set the desired width here
    }),
    menu: (styles: any) => ({
      ...styles,
      width: '150px',  // Ensure the menu width matches the control width
    }),
  };

  return (
    <div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight - 100}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        canvas
      </canvas>

      <div className="tools">
        <Select
          options={shapesList}
          onChange={handleShapeChange}
          placeholder="Draw tools"
          styles={customStyles}
          menuPlacement="top"
        />
        <Select
          options={actionList}
          onChange={handleActionChange}
          placeholder="Select Tool"
          styles={customStyles}
          menuPlacement="top"
        />
      </div>
    </div>
  );
};

export default DrawingScreen;
