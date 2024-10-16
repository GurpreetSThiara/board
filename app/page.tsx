/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, Pen, Highlighter, Brush, Eraser, Square, Circle, Triangle, Image as ImageIcon, Undo, Redo, Save, ZoomIn, ZoomOut, Move, Trash, Type, Plus, X } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Shape = {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'text' | 'image' | 'freehand';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  fontSize?: number;
  imageUrl?: string;
  points?: { x: number; y: number }[];
  lineWidth?: number;
  filled?: boolean;
  penType?: 'pencil' | 'pen' | 'highlighter' | 'brush';
}

type Tab = {
  id: string;
  name: string;
  shapes: Shape[];
}

type Collaborator = {
  id: string;
  name: string;
  avatar: string;
}

type SharedFile = {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
}

export default function AdvancedWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState('pencil')
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', name: 'Untitled', shapes: [] }])
  const [activeTab, setActiveTab] = useState('1')
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [currentFreehandShape, setCurrentFreehandShape] = useState<Shape | null>(null)
  const [filled, setFilled] = useState(false)
  const [penType, setPenType] = useState<'pencil' | 'pen' | 'highlighter' | 'brush'>('pencil')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'John Doe', avatar: '/placeholder.svg?height=32&width=32' },
    { id: '2', name: 'Jane Smith', avatar: '/placeholder.svg?height=32&width=32' },
  ])
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    { id: '1', name: 'Project Brief.pdf', type: 'document', url: '#' },
    { id: '2', name: 'Logo.png', type: 'image', url: '#' },
  ])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = window.innerWidth - 300 // Adjust for sidebar width
      canvas.height = window.innerHeight - 100 // Adjust for header height
      const context = canvas.getContext('2d')
      setCtx(context)
    }
  }, [])

  useEffect(() => {
    if (ctx) {
      console.log("ctxxxxxxxxxxxxxxxxxxxxxxx")
     
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.font = `${fontSize}px Arial`
    }
  }, [color, brushSize, fontSize, ctx])

  useEffect(() => {
    drawShapes()
  }, [tabs, activeTab, zoom, pan])

  const drawShapes = () => {
    if (!ctx || !canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    const activeShapes = tabs.find(tab => tab.id === activeTab)?.shapes || []
    activeShapes.forEach(shape => {
      ctx.fillStyle = shape.color
      ctx.strokeStyle = shape.color
      ctx.lineWidth = shape.lineWidth || 1
      const { x, y, width, height } = shape

      switch (shape.type) {
        case 'rectangle':
          if (shape.filled) {
            ctx.fillRect(x, y, width, height)
          } else {
            ctx.strokeRect(x, y, width, height)
          }
          break
        case 'circle':
          ctx.beginPath()
          ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI)
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          shape.filled ? ctx.fill() : ctx.stroke()
          break
        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(x + width / 2, y)
          ctx.lineTo(x, y + height)
          ctx.lineTo(x + width, y + height)
          ctx.closePath()
          shape.filled ? ctx.fill() : ctx.stroke()
          break
        case 'text':
          ctx.font = `${shape.fontSize}px Arial`
          ctx.fillText(shape.text || '', x, y + height)
          break
        case 'image':
          if (shape.imageUrl) {
            const img = new Image()
            img.src = shape.imageUrl
            img.onload = () => {
              ctx.drawImage(img, x, y, width, height)
            }
          }
          break
        case 'freehand':
          if (shape.points && shape.points.length > 0) {
            ctx.beginPath()
            ctx.moveTo(shape.points[0].x, shape.points[0].y)
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y)
            }
            if (shape.penType === 'highlighter') {
              ctx.globalAlpha = 0.5
            }
            if(shape.penType === 'pencil'){
              let xLast = x;
              let  yLast = y;	
              let brushDiameter = 2
              ctx.strokeStyle = 'rgba(255,0,0,'+(0.4+Math.random()*0.2)+')';
              let length = Math.round(Math.sqrt(Math.pow(x-xLast,2)+Math.pow(y-yLast,2))/(5/2));
              let xUnit = (x-xLast)/length;
              let yUnit = (y-yLast)/length;
              for(var i=0; i<length; i++ ){
                let xCurrent = xLast+(i*xUnit);	
                let yCurrent = yLast+(i*yUnit);
                let xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;			
                let yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
                ctx.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
              }
              xLast = x;
              yLast = y;	
              ctx.lineWidth = 5.5 + 0.4 * 1.9;

              ctx.moveTo(xLast, yLast);	
            }
            ctx.stroke()
            ctx.globalAlpha = 1
          }
          break
      }
    })
    ctx.restore()
  }

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctx) return
    const { offsetX, offsetY } = e.nativeEvent
    const x = (offsetX - pan.x) / zoom
    const y = (offsetY - pan.y) / zoom

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)

    if (['rectangle', 'circle', 'triangle'].includes(tool)) {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: tool as 'rectangle' | 'circle' | 'triangle',
        x,
        y,
        width: 0,
        height: 0,
        color,
        filled,
        lineWidth: brushSize
      }
      updateShapes(prevShapes => [...prevShapes, newShape])
      setSelectedShape(newShape)
    } else if (tool === 'move') {
      const clickedShape = tabs.find(tab => tab.id === activeTab)?.shapes.find(shape => 
        x >= shape.x && x <= shape.x + shape.width &&
        y >= shape.y && y <= shape.y + shape.height
      )
      if (clickedShape) {
        setSelectedShape(clickedShape)
        setIsDragging(true)
        setDragStart({ x: x - clickedShape.x, y: y - clickedShape.y })
      }
    } else if (['pencil', 'pen', 'highlighter', 'brush'].includes(tool)) {
      const newFreehandShape: Shape = {
        id: Date.now().toString(),
        type: 'freehand',
        x,
        y,
        width: 0,
        height: 0,
        color,
        points: [{ x, y }],
        lineWidth: brushSize,
        penType: tool as 'pencil' | 'pen' | 'highlighter' | 'brush'
      }
      setCurrentFreehandShape(newFreehandShape)
      updateShapes(prevShapes => [...prevShapes, newFreehandShape])
    }
  }

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctx) return
    const { offsetX, offsetY } = e.nativeEvent
    const x = (offsetX - pan.x) / zoom
    const y = (offsetY - pan.y) / zoom

    if (['pencil', 'pen', 'highlighter', 'brush'].includes(tool)) {
      setCurrentFreehandShape(prevShape => {
        if (prevShape) {
          const updatedPoints = [...(prevShape.points || []), { x, y }]
          const updatedShape = { ...prevShape, points: updatedPoints }
          updateShapes(prevShapes => 
            prevShapes.map(shape => 
              shape.id === prevShape.id ? updatedShape : shape
            )
          )
          return updatedShape
        }
        return null
      })
    } else if (tool === 'eraser') {
      const eraserSize = brushSize / zoom
      updateShapes(prevShapes => 
        prevShapes.map(shape => {
          if (shape.type === 'freehand' && shape.points) {
            const newPoints = shape.points.filter(point => 
              Math.hypot(point.x - x, point.y - y) > eraserSize
            )
            return { ...shape, points: newPoints }
          }
          return shape
        })
      )
    } else if (['rectangle', 'circle', 'triangle'].includes(tool) && selectedShape) {
      updateShapes(prevShapes => prevShapes.map(shape => 
        shape.id === selectedShape.id
          ? { ...shape, width: x - shape.x, height: y - shape.y }
          : shape
      ))
    } else if (tool === 'move' && isDragging && selectedShape) {
      updateShapes(prevShapes => prevShapes.map(shape =>
        shape.id === selectedShape.id
          ? { ...shape, x: x - dragStart.x, y: y - dragStart.y }
          : shape
      ))
    }
  }

  const endDrawing = () => {
    setIsDrawing(false)
    setIsDragging(false)
    setIsResizing(false)
    setCurrentFreehandShape(null)
    if (ctx) {
      ctx.closePath()
    }
    setSelectedShape(null)
  }

  const addText = (e: React.MouseEvent) => {
    if (!text) return
    const { offsetX, offsetY } = e.nativeEvent
    const x = (offsetX - pan.x) / zoom
    const y = (offsetY - pan.y) / zoom
    const newShape: Shape = {
      id: Date.now().toString(),
      type: 'text',
      x,
      y,
      width: ctx?.measureText(text).width || 0,
      height: fontSize,
      color,
      text,
      fontSize
    }
    updateShapes(prevShapes => [...prevShapes, newShape])
    setText('')
  }

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const newShape: Shape = {
          id: Date.now().toString(),
          type: 'image',
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          color: 'transparent',
          imageUrl: event.target?.result as string
        }
        updateShapes(prevShapes => [...prevShapes, newShape])
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const updateShapes = (updater: (shapes: Shape[]) => Shape[]) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === activeTab
        ? { ...tab, shapes: updater(tab.shapes) }
        : tab
    ))
  }

  const undo = () => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === activeTab
        ? { ...tab, shapes: tab.shapes.slice(0, -1) }
        : tab
    ))
  }

  const redo = () => {
    // Redo functionality would require storing future states
  }

  const clearCanvas = () => {
    updateShapes(() => [])
  }

  const saveImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const zoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.1, 5))
  }

  const zoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.1, 0.1))
  }

  const handlePan = (e: React.MouseEvent) => {
    if (tool === 'move' && isDrawing && !selectedShape) {
      setPan(prevPan => ({
        x:  prevPan.x + e.movementX,
        y: prevPan.y + e.movementY
      }))
    }
  }

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `Untitled ${tabs.length + 1}`,
      shapes: []
    }
    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTab(newTab.id)
  }

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    console.log("first")
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))

    if (!imageBlob) {
      console.error('Failed to create image blob')
      return
    }
    console.log("first")

    const formData = new FormData()
    formData.append('image', imageBlob, 'sketch.png')
    

    try {
      console.log("calll")
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      // const data = await response.json()
      // setGeneratedImage(data.imageUrl)
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }
  const removeTab = (tabId: string) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId))
    if (activeTab === tabId) {
      setActiveTab(tabs[0]?.id || '')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col flex-grow">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex-grow">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="relative">
                    {tab.name}
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTab(tab.id)
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button onClick={addTab} size="sm" variant="outline">
                <Plus size={16} />
              </Button>
            </Tabs>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <Button onClick={() => setTool('pencil')} variant={tool === 'pencil' ? 'default' : 'outline'}><Pencil size={16} /></Button>
              <Button onClick={() => setTool('pen')} variant={tool === 'pen' ? 'default' : 'outline'}><Pen size={16} /></Button>
              <Button onClick={() => setTool('highlighter')} variant={tool === 'highlighter' ? 'default' : 'outline'}><Highlighter size={16} /></Button>
              <Button onClick={() => setTool('brush')} variant={tool === 'brush' ? 'default' : 'outline'}><Brush size={16} /></Button>
              <Button onClick={() => setTool('eraser')} variant={tool === 'eraser' ? 'default' : 'outline'}><Eraser size={16} /></Button>
              <Button onClick={() => setTool('rectangle')} variant={tool === 'rectangle' ? 'default' : 'outline'}><Square size={16} /></Button>
              <Button onClick={() => setTool('circle')} variant={tool === 'circle' ? 'default' : 'outline'}><Circle size={16} /></Button>
              <Button onClick={() => setTool('triangle')} variant={tool === 'triangle' ? 'default' : 'outline'}><Triangle size={16} /></Button>
              <Button onClick={() => setTool('text')} variant={tool === 'text' ? 'default' : 'outline'}><Type size={16} /></Button>
              <Button onClick={handleGenerate}> Generate Image</Button>
              <label htmlFor="imageUpload">
                <Button asChild variant="outline">
                  <span><ImageIcon size={16} /></span>
                </Button>
              </label>
              <Input id="imageUpload" type="file" className="hidden" onChange={addImage} accept="image/*" />
            </div>
            <div className="flex items-center space-x-4">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-1 rounded"
              />
              <Slider
                min={1}
                max={50}
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                className="w-32"
              />
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                  <SelectItem value="24">24px</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={zoomIn}><ZoomIn size={16} /></Button>
              <Button onClick={zoomOut}><ZoomOut size={16} /></Button>
              <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
              <Button onClick={() => setTool('move')} variant={tool === 'move' ? 'default' : 'outline'}><Move size={16} /></Button>
              <div className="flex items-center space-x-2">
                <Switch
                  id="filled-mode"
                  checked={filled}
                  onCheckedChange={setFilled}
                />
                <Label htmlFor="filled-mode">Filled</Label>
              </div>
              <Button onClick={undo}><Undo size={16} /></Button>
              <Button onClick={redo}><Redo size={16} /></Button>
              <Button onClick={saveImage}><Save size={16} /></Button>
              <Button onClick={clearCanvas}><Trash size={16} /></Button>
            </div>
          </div>
        </header>
        <main className="flex-grow relative overflow-hidden">
          <canvas
          id="whiteboard"
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{
              cursor: tool === 'move' ? 'move' : 'crosshair'
            }}
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              draw(e)
              handlePan(e)
            }}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            onClick={tool === 'text' ? addText : undefined}
          />
        </main>
        {tool === 'text' && (
          <div className="absolute bottom-4 left-4 flex space-x-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" />
            <Button onClick={() => setTool('pencil')}>Done</Button>
          </div>
        )}
      </div>
      <aside className="w-80 bg-white p-4 shadow-lg overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Collaborators</h2>
        <ScrollArea className="h-40 mb-6">
          {collaborators.map(collaborator => (
            <div key={collaborator.id} className="flex items-center space-x-2 mb-2">
              <Avatar>
                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{collaborator.name}</span>
            </div>
          ))}
        </ScrollArea>
        <h2 className="text-lg font-semibold mb-4">Shared Files</h2>
        <ScrollArea className="h-40">
          {sharedFiles.map(file => (
            <div key={file.id} className="flex items-center space-x-2 mb-2">
              {file.type === 'image' ? <ImageIcon size={16} /> : <>FILETEXT</>}
              <span>{file.name}</span>
            </div>
          ))}
        </ScrollArea>
      </aside>
      {generatedImage && <>
      <div className="h-96 w-96">
      <img className='h-full w-full object-contain' src={generatedImage} alt="Generated" />
      </div>
      </>}
    </div>
  )
}