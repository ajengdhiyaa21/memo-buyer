import { useEffect, useRef, useState } from "react"
import { PenLine } from "lucide-react"

export default function SignaturePad({ value, onChange, error }: { value?: string; onChange: (value: string) => void; error?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(!value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !value) return
    const image = new Image()
    image.onload = () => canvas.getContext("2d")?.drawImage(image, 0, 0)
    image.src = value
  }, [value])

  const position = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const point = "touches" in event ? event.touches[0] : event
    return { x: (point.clientX - rect.left) * canvas.width / rect.width, y: (point.clientY - rect.top) * canvas.height / rect.height }
  }
  const start = (event: React.MouseEvent | React.TouchEvent) => { event.preventDefault(); drawing.current = true; const ctx = canvasRef.current!.getContext("2d")!; const p = position(event); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
  const move = (event: React.MouseEvent | React.TouchEvent) => { if (!drawing.current) return; event.preventDefault(); const ctx = canvasRef.current!.getContext("2d")!; const p = position(event); ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.stroke(); setEmpty(false) }
  const end = () => { if (!drawing.current) return; drawing.current = false; onChange(canvasRef.current!.toDataURL("image/png")) }
  const clear = () => { const canvas = canvasRef.current!; canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height); setEmpty(true); onChange("") }
  return <div>
    <div className={`relative rounded-2xl border-2 border-dashed ${error ? "border-red-300" : "border-slate-300"} bg-slate-50`}>
      <canvas ref={canvasRef} width={600} height={200} className="h-[200px] w-full cursor-crosshair touch-none rounded-2xl bg-white" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
      {empty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><p className="flex items-center gap-1.5 text-[12px] text-slate-400"><PenLine className="h-3.5 w-3.5"/>Tanda tangan di area ini</p></div>}
    </div>
    <div className="mt-2 flex justify-end"><button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-red-600">↻ Hapus & Ulangi</button></div>
  </div>
}
