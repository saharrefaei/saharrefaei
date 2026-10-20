import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, Color, ImageBitmapLoader, MathUtils, Object3D, SRGBColorSpace, Texture, type Group, type InstancedMesh } from 'three'
import { events, type CommunityEvent, type EventPhoto } from '../../content/events'
import { interests, type Interest, type InterestGroup } from '../../content/interests'
import { emailAddress, links, profile } from '../../content/profile'
import { sceneInput } from '../../lib/sceneInput'
import { renderDotGrid } from '../../lib/dotFont'
import { Anchor } from '../layout'
import { useAnchorMetrics, useLayout, useNearKf } from '../layoutCore'
import { lightbox } from '../lightboxStore'
import { sectionStart } from '../path'
import { Panel, Title3D } from '../ui3d'
import { Orb } from './Intro'

const damp = MathUtils.damp

/* ───────────────────────── Focus: interests floating at different depths ───────────────────────── */

const GROUP_COLOR: Record<InterestGroup, string> = {
  Craft: 'var(--orange)',
  Intelligence: 'var(--pink)',
  Tooling: 'var(--magenta)',
}

type Slot = [number, number, number]
const STOP_A: Slot[] = [
  [-0.52, 0.3, 9],
  [0.42, 0.4, 12.5],
  [-0.3, -0.36, 15],
  [0.5, -0.32, 10.5],
]
const STOP_B: Slot[] = [
  [0.5, 0.32, 9.5],
  [-0.46, 0.4, 12],
  [0.22, -0.4, 14.5],
  [-0.5, -0.34, 10],
]
const NARROW_SLOTS: Slot[] = [
  [-0.18, 0.52, 9],
  [0.2, 0.2, 11],
  [-0.18, -0.12, 10],
  [0.16, -0.44, 9.5],
]

const STOP_ITEMS: Interest[][] = [
  interests.filter((i) => i.group !== 'Intelligence'),
  interests.filter((i) => i.group === 'Intelligence'),
]

function InterestItem({ item, first }: { item: Interest; first: boolean }) {
  const { narrow } = useLayout()
  return (
    <Panel px={narrow ? 270 : 360} frac={narrow ? 0.7 : 0.26} theme="paper" className="wp--bare">
      {first ? <h2 className="sr-only">Engineering and AI interests</h2> : null}
      <button type="button" className="wp-tag" style={{ '--group': GROUP_COLOR[item.group] } as CSSProperties}>
        <span className="wp-tag__group">
          <span className="wp-tag__dot" aria-hidden="true" />
          {item.group}
        </span>
        <span className="wp-tag__title" style={narrow ? { fontSize: 40 } : undefined}>
          {item.title}
        </span>
        <span className="wp-tag__note">{item.note}</span>
      </button>
    </Panel>
  )
}

function FocusGhost() {
  const { visibleW } = useAnchorMetrics()
  return <Title3D text="FOCUS" size={visibleW * 0.24} look="ghostInk" depth={visibleW * 0.03} />
}

export function InterestsStation() {
  const first = sectionStart.interests
  const { narrow } = useLayout()
  return (
    <>
      {STOP_ITEMS.map((items, stop) =>
        items.map((item, i) => {
          const slot = (narrow ? NARROW_SLOTS : stop === 0 ? STOP_A : STOP_B)[i]
          return (
            <Anchor key={item.id} kf={first + stop} desktop={slot} narrow={slot} range={1.4}>
              <InterestItem item={item} first={stop === 0 && i === 0} />
            </Anchor>
          )
        }),
      )}
      <Anchor kf={first} desktop={[0, 0.05, 34]} narrow={[0, 0.3, 34]} range={2.2}>
        <FocusGhost />
      </Anchor>
      {narrow ? null : (
        // off to the side: visible from the first stop, well outside the second stop's view
        <Anchor kf={first} desktop={[0.8, 0.7, 20]} range={1.6}>
          <Orb frac={0.22} />
        </Anchor>
      )}
    </>
  )
}

/* ───────────────────────── Events: floating photo frames you can fly past and open ───────────────────────── */

/**
 * Photo loading is staged so it never costs a visible frame:
 *   1. the image is fetched AND decoded off the main thread (ImageBitmap),
 *   2. the GPU upload (several ms for a big photo) happens one texture per frame,
 *   3. only then is the frame handed the finished texture.
 * (drei's useTexture uploads every texture synchronously the moment it resolves.)
 */
type PendingUpload = { texture: Texture; resolve: (texture: Texture) => void }
const uploadQueue: PendingUpload[] = []
const photoCache = new Map<string, Promise<Texture>>()

function loadPhoto(src: string): Promise<Texture> {
  const cached = photoCache.get(src)
  if (cached) return cached
  const promise = new Promise<Texture>((resolve, reject) => {
    const loader = new ImageBitmapLoader()
    loader.setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' })
    loader.load(
      src,
      (bitmap) => {
        const texture = new Texture(bitmap)
        texture.flipY = false // the bitmap was already flipped while decoding
        texture.colorSpace = SRGBColorSpace
        texture.anisotropy = 8
        texture.needsUpdate = true
        uploadQueue.push({ texture, resolve })
      },
      undefined,
      reject,
    )
  })
  photoCache.set(src, promise)
  return promise
}

function usePhotoTexture(src: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    let alive = true
    loadPhoto(src).then(
      (loaded) => alive && setTexture(loaded),
      () => undefined, // a missing photo just leaves its frame out; the rest of the world is unaffected
    )
    return () => {
      alive = false
    }
  }, [src])
  return texture
}

function UploadPump() {
  const gl = useThree((state) => state.gl)
  useFrame(() => {
    const next = uploadQueue.shift()
    if (!next) return
    gl.initTexture(next.texture)
    next.resolve(next.texture)
  })
  return null
}

/** The "SAMPLE PHOTO" caption under placeholder frames: drawn once and shared, so it costs no geometry per frame. */
let sampleLabel: CanvasTexture | null = null
function getSampleLabel(): CanvasTexture {
  if (sampleLabel) return sampleLabel
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 192
  const ctx = canvas.getContext('2d')!
  ctx.font = '800 150px "Bricolage Grotesque Variable", "Helvetica Neue", Arial, sans-serif'
  ctx.fontStretch = 'condensed'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ff3d8b'
  ctx.fillText('SAMPLE PHOTO', 512, 100)
  sampleLabel = new CanvasTexture(canvas)
  sampleLabel.colorSpace = SRGBColorSpace
  sampleLabel.anisotropy = 8
  return sampleLabel
}

const FRAME_Y = [0.5, -0.4, 0.8, -0.2]
const FRAME_ROLL = [0.03, -0.04, 0.02, -0.03]

function PhotoFrame(props: { event: CommunityEvent; photo: EventPhoto; index: number; narrow: boolean }) {
  const texture = usePhotoTexture(props.photo.src)
  return texture ? <LoadedFrame {...props} texture={texture} /> : null
}

function LoadedFrame({
  event,
  photo,
  index,
  narrow,
  texture,
}: {
  event: CommunityEvent
  photo: EventPhoto
  index: number
  narrow: boolean
  texture: Texture
}) {
  const [hover, setHover] = useState(false)
  const group = useRef<Group>(null)

  const side = index % 2 === 0 ? 1 : -1
  const x = side * (narrow ? 1.75 : side < 0 ? 5 + (index % 3) * 0.4 : 3.7 + (index % 3) * 0.35)
  const y = FRAME_Y[index % 4] * (narrow ? 0.8 : 1)
  const z = -(8 + index * 6.2)
  const image = texture.image as { width: number; height: number } | undefined
  const aspect = image ? image.width / image.height : 1.5
  const baseW = (aspect >= 1 ? 3.6 : 2.6) * (narrow ? 0.7 : 1)
  const w = baseW
  const h = baseW / aspect

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hover])

  useFrame(({ clock }, delta) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    g.position.y = y + Math.sin(t * 0.6 + index * 1.7) * 0.12
    g.rotation.z = FRAME_ROLL[index % 4] + Math.sin(t * 0.4 + index) * 0.02
    g.scale.setScalar(damp(g.scale.x, hover ? 1.09 : 1, 8, Math.min(delta, 0.05)))
  })

  return (
    <group ref={group} position={[x, y, z]} rotation={[0, -side * 0.42, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          lightbox.open(event.id, index)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[w + 0.24, h + 0.24, 0.1]} />
        <meshPhysicalMaterial color="#f6eee8" metalness={1} roughness={0.14} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.12]} scale={1.18}>
        <planeGeometry args={[w + 0.24, h + 0.24]} />
        <meshBasicMaterial color="#ff3d8b" transparent opacity={hover ? 0.55 : 0.18} depthWrite={false} />
      </mesh>
      {photo.sample ? (
        <mesh position={[0, -(h / 2 + 0.42), 0.05]}>
          <planeGeometry args={[2.6, 0.49]} />
          <meshBasicMaterial map={getSampleLabel()} transparent toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  )
}

function EventKind({ text }: { text: string }) {
  const { visibleW } = useAnchorMetrics()
  const { narrow } = useLayout()
  return <Title3D text={text} size={visibleW * (narrow ? 0.12 : 0.085)} maxWidth={visibleW * (narrow ? 0.88 : 0.5)} look="chrome" depth={visibleW * 0.015} />
}

function EventsGhost() {
  const { visibleW } = useAnchorMetrics()
  return <Title3D text="EVENTS" size={visibleW * 0.22} look="ghost" depth={visibleW * 0.03} />
}

function EventPanel({ event }: { event: CommunityEvent }) {
  const { narrow } = useLayout()
  const allSample = event.photos.every((p) => p.sample)
  return (
    <Panel px={narrow ? 330 : 410} frac={narrow ? 0.94 : 0.3} theme="ink">
      <p className="wp__eyebrow wp__muted">
        {event.kind}
        {event.location ? ` · ${event.location}` : ''}
        {event.date ? ` · ${event.date}` : ''}
      </p>
      <h2 className="wp__h" style={{ marginTop: 8, fontSize: narrow ? 28 : 32 }}>
        {event.title}
      </h2>
      <p className="wp__badges">
        <span className={`wp__badge ${event.verified ? 'wp__badge--real' : 'wp__badge--sample'}`}>
          {event.verified ? 'Real event' : 'Sample event'}
        </span>
        {allSample ? <span className="wp__badge wp__badge--sample">Sample photos</span> : null}
      </p>
      {event.verified ? (
        <p style={{ marginTop: 10 }}>
          <span className="wp__muted">My role: </span>
          <strong>{event.role}</strong>
        </p>
      ) : null}
      <p className="wp__muted" style={{ marginTop: 8 }}>
        {event.description}
      </p>
      <ul className="wp__thumbs" aria-label={`Photos from ${event.title}`}>
        {event.photos.map((photo, i) => (
          <li key={photo.src}>
            <button type="button" aria-label={`Open photo ${i + 1} of ${event.photos.length}`} onClick={() => lightbox.open(event.id, i)}>
              <img src={photo.src} alt="" loading="lazy" width={64} height={46} />
            </button>
          </li>
        ))}
      </ul>
      <p className="wp__links">
        <button type="button" className="pill pill--solid" onClick={() => lightbox.open(event.id, 0)}>
          View photos <span aria-hidden="true">↗</span>
        </button>
      </p>
    </Panel>
  )
}

function EventStop({ event, kf, index, galleryLoaded }: { event: CommunityEvent; kf: number; index: number; galleryLoaded: boolean }) {
  const { narrow } = useLayout()
  return (
    <>
      <Anchor kf={kf} desktop={[-0.2, 0.68, 16]} narrow={[0, 0.7, 14]} range={1.6}>
        <EventKind text={`${event.verified ? '' : 'SAMPLE '}${event.kind.toUpperCase()}`} />
      </Anchor>
      <Anchor kf={kf} desktop={[-0.56, -0.05, 8]} narrow={[0, -0.34, 8]} range={1.2}>
        <EventPanel event={event} />
      </Anchor>
      {/* d = 0: the group sits exactly at the stop's camera, so photos are placed in plain camera-frame coordinates */}
      <Anchor kf={kf} desktop={[0, 0, 0]} narrow={[0, 0, 0]} range={2.3}>
        {galleryLoaded
          ? event.photos.map((photo, i) => <PhotoFrame key={photo.src} event={event} photo={photo} index={i} narrow={narrow} />)
          : null}
      </Anchor>
      {index === 0 ? (
        <Anchor kf={kf} desktop={[0, 0.1, 34]} narrow={[0, 0.2, 34]} range={2.4}>
          <EventsGhost />
        </Anchor>
      ) : null}
    </>
  )
}

/**
 * Photos are heavy, so they are built only once the camera is within a few stops of the gallery
 * (not at page load), and then stay resident. That leaves the textures time to download, decode and
 * upload to the GPU well before they come into view.
 */
function useGalleryLoaded(): boolean {
  const approaching = useNearKf(sectionStart.events, 6.5, false)
  const [loaded, setLoaded] = useState(false)
  // one-way latch (setState during render is the sanctioned way to derive state from a changing value)
  if (approaching && !loaded) setLoaded(true)
  return loaded
}

export function EventsStation() {
  const first = sectionStart.events
  const galleryLoaded = useGalleryLoaded()
  return (
    <>
      <UploadPump />
      {events.map((event, i) => (
        <EventStop key={event.id} event={event} kf={first + i} index={i} galleryLoaded={galleryLoaded} />
      ))}
    </>
  )
}

/* ───────────────────────── Contact: a dot-matrix HELLO built from real 3D spheres ───────────────────────── */

function DotWord3D({ text, width, height }: { text: string; width: number; height: number }) {
  const grid = useMemo(() => renderDotGrid(text), [text])
  const cell = width / grid.cols
  const lit = useRef<InstancedMesh>(null)
  const off = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const cells = useMemo(() => {
    const on: { x: number; y: number; col: number; row: number }[] = []
    const dim: { x: number; y: number }[] = []
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const x = (col - (grid.cols - 1) / 2) * cell
        const y = -(row - (grid.rows - 1) / 2) * cell
        if (grid.lit[row * grid.cols + col]) on.push({ x, y, col, row })
        else dim.push({ x, y })
      }
    }
    return { on, dim }
  }, [grid, cell])
  const hot = useMemo(() => new Color('#ff5a1f'), [])
  const white = useMemo(() => new Color('#fff3ea'), [])
  const tint = useMemo(() => new Color(), [])

  useLayoutEffect(() => {
    const mesh = off.current
    if (!mesh) return
    cells.dim.forEach((c, i) => {
      dummy.position.set(c.x, c.y, 0)
      dummy.scale.setScalar(cell * 0.1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [cells, cell, dummy])

  useFrame(({ clock }) => {
    const mesh = lit.current
    if (!mesh) return
    const t = clock.elapsedTime
    const px = (sceneInput.pointerX * width) / 2
    const py = (sceneInput.pointerY * height) / 2
    cells.on.forEach((c, i) => {
      const d = Math.hypot(c.x - px, c.y - py)
      const influence = Math.exp(-((d / (cell * 3.4)) ** 2))
      const pulse = 1 + 0.18 * Math.sin(t * 2 + c.col * 0.45 + c.row * 0.3)
      dummy.position.set(c.x, c.y, influence * cell * 0.9)
      dummy.scale.setScalar(cell * 0.34 * pulse * (1 + 0.7 * influence))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, tint.copy(hot).lerp(white, influence))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={lit} args={[undefined, undefined, cells.on.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial emissive="#ff5a1f" emissiveIntensity={0.55} roughness={0.3} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={off} args={[undefined, undefined, cells.dim.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#fffaf6" transparent opacity={0.16} />
      </instancedMesh>
    </group>
  )
}

function Hello() {
  const { visibleW, visibleH } = useAnchorMetrics()
  const { narrow } = useLayout()
  return <DotWord3D text="HELLO" width={visibleW * (narrow ? 0.9 : 0.74)} height={visibleH} />
}

const CONTACT_ROWS = [
  { label: 'Email', value: emailAddress, href: links.email, external: false },
  { label: 'GitHub', value: 'github.com/saharrefaei', href: links.github, external: true },
  { label: 'LinkedIn', value: 'linkedin.com/in/sahar-refaei', href: links.linkedin, external: true },
] as const

export function ContactStation() {
  const kf = sectionStart.contact
  const { narrow } = useLayout()
  return (
    <>
      <Anchor kf={kf} desktop={[0, 0.4, 15]} narrow={[0, 0.5, 14]} range={2.2}>
        <Hello />
      </Anchor>

      <Anchor kf={kf} desktop={[0, -0.5, 10]} narrow={[0, -0.42, 8.5]} range={1.3}>
        <Panel px={narrow ? 330 : 640} frac={narrow ? 0.94 : 0.56} theme="ink">
          <h2 style={{ fontSize: narrow ? 30 : 40 }}>Let’s build something thoughtful.</h2>
          <p className="wp__muted" style={{ marginTop: 10 }}>
            Frontend engineering, applied AI, or an idea worth prototyping: I’d love to hear what you’re working on.
          </p>
          <ul className="wp__rows">
            {CONTACT_ROWS.map((row) => (
              <li key={row.label}>
                <a
                  className="wp__row"
                  href={row.href}
                  {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="wp__eyebrow wp__muted">{row.label}</span>
                  <span className="wp__row-value">{row.value}</span>
                  <span aria-hidden="true">{row.external ? '↗' : '→'}</span>
                  {row.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                </a>
              </li>
            ))}
          </ul>
          <footer className="wp__footer wp__muted">
            <span>
              © {new Date().getFullYear()} {profile.name} · {profile.location}
            </span>
            <a href="#top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </footer>
        </Panel>
      </Anchor>

      <Anchor kf={kf} desktop={[0.82, 0.72, 28]} narrow={[0.35, 0.78, 28]} range={2.4}>
        <Orb frac={narrow ? 0.6 : 0.3} />
      </Anchor>
    </>
  )
}
