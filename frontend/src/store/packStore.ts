import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PackRow {
  id: string
  cat: string
  catTotal: number
  name: string
  mid: number | null
  live: string
  photo: boolean
  video: boolean
  link: string
  comment: string
  tag: string | null
}

export interface TagDef { id: string; label: string; bg: string; border: string }

export const TAG_DEFS: TagDef[] = [
  { id: 'yellow', label: 'Working / In scope', bg: '#FFF8C5', border: '#FACC15' },
  { id: 'blue', label: 'High priority', bg: '#DBE9F7', border: '#5B9BD5' },
  { id: 'cyan', label: 'Change / addition / redo', bg: '#CDEEEE', border: '#5BC0BE' },
  { id: 'orange', label: 'Prompts to review', bg: '#FCE4CB', border: '#F4A36C' },
  { id: 'red', label: 'Error — change ASAP', bg: '#FCD3D3', border: '#E26A6A' },
]

export const SHEETS = [
  { id: 'imp', label: 'IMP Links', count: 0 },
  { id: 'product', label: 'Product', count: 224 },
  { id: 'tryon', label: 'Try on', count: 330 },
  { id: 'mockup', label: 'Mockup', count: 331 },
  { id: 'solo_current', label: 'Solo (Current)', count: 218 },
  { id: 'solo_new', label: 'SOLO (!NEW)', count: 36 },
  { id: 'duo_current', label: 'Duo (Current)', count: 142 },
  { id: 'duo_new', label: 'DUO (!NEW)', count: 22 },
  { id: 'space', label: 'Space Design', count: 38 },
]

const PRODUCT_ROWS: PackRow[] = [
  { id: 'MDL-J01', cat: 'Jewelry & Watches', catTotal: 316, name: 'Earring', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J02', cat: 'Jewelry & Watches', catTotal: 316, name: 'Necklace', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J03', cat: 'Jewelry & Watches', catTotal: 316, name: 'Ring', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J04', cat: 'Jewelry & Watches', catTotal: 316, name: 'Diamond Bracelet', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: 'Photo refresh next sprint', tag: 'yellow' },
  { id: 'MDL-J05', cat: 'Jewelry & Watches', catTotal: 316, name: 'Bangle', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J06', cat: 'Jewelry & Watches', catTotal: 316, name: 'Anklet', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J07', cat: 'Jewelry & Watches', catTotal: 316, name: 'Chain', mid: null, live: 'No', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J08', cat: 'Jewelry & Watches', catTotal: 316, name: 'Gold Pendant', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J09', cat: 'Jewelry & Watches', catTotal: 316, name: 'Pearl Jewelry Set', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-J10', cat: 'Jewelry & Watches', catTotal: 316, name: 'Silver Jewelry', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J11', cat: 'Jewelry & Watches', catTotal: 316, name: 'Jhumka', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-J12', cat: 'Jewelry & Watches', catTotal: 316, name: 'Luxury Watch', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: 'High Priority', tag: 'blue' },
  { id: 'MDL-J13', cat: 'Jewelry & Watches', catTotal: 316, name: 'Kundan Necklace', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-W01', cat: 'Watch', catTotal: 42, name: 'Luxury Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W02', cat: 'Watch', catTotal: 42, name: 'Smart Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W03', cat: 'Watch', catTotal: 42, name: 'Kids Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W04', cat: 'Watch', catTotal: 42, name: 'Sports Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-W05', cat: 'Watch', catTotal: 42, name: 'Casual Watch', mid: null, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-S01', cat: 'Skincare', catTotal: 88, name: 'Serum', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: 'Satyam prompts', tag: 'orange' },
  { id: 'MDL-S02', cat: 'Skincare', catTotal: 88, name: 'Moisturizer', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S03', cat: 'Skincare', catTotal: 88, name: 'Face Cleanser', mid: 68, live: 'Yes', photo: true, video: false, link: 'https://docs.example.com/face-cleanser', comment: 'Announcement: product change', tag: 'cyan' },
  { id: 'MDL-S04', cat: 'Skincare', catTotal: 88, name: 'Toner', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S05', cat: 'Skincare', catTotal: 88, name: 'Eye Cream', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-S06', cat: 'Skincare', catTotal: 88, name: 'Sunscreen SPF50', mid: 68, live: 'No', photo: false, video: false, link: '', comment: 'Error — fix tag overlap', tag: 'red' },
  { id: 'MDL-S07', cat: 'Skincare', catTotal: 88, name: 'Face Mask', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A01', cat: 'Apparel', catTotal: 124, name: 'T-shirt Crew', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A02', cat: 'Apparel', catTotal: 124, name: 'Hoodie Streetwear', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A03', cat: 'Apparel', catTotal: 124, name: 'Denim Jacket', mid: 68, live: 'Yes', photo: true, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A04', cat: 'Apparel', catTotal: 124, name: 'Summer Dress', mid: 68, live: 'Pending', photo: false, video: false, link: '', comment: 'High priority for JP launch', tag: 'blue' },
  { id: 'MDL-A05', cat: 'Apparel', catTotal: 124, name: 'Blazer Formal', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A06', cat: 'Apparel', catTotal: 124, name: 'Sneakers', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-A07', cat: 'Apparel', catTotal: 124, name: 'Heels Pumps', mid: 68, live: '', photo: false, video: false, link: '', comment: '', tag: null },
  { id: 'MDL-A08', cat: 'Apparel', catTotal: 124, name: 'Handbag Tote', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H01', cat: 'Home & Living', catTotal: 54, name: 'Candle Pillar', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H02', cat: 'Home & Living', catTotal: 54, name: 'Vase Ceramic', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
  { id: 'MDL-H03', cat: 'Home & Living', catTotal: 54, name: 'Throw Blanket', mid: 68, live: 'Pending', photo: false, video: false, link: '', comment: 'Redo on white BG', tag: 'cyan' },
  { id: 'MDL-H04', cat: 'Home & Living', catTotal: 54, name: 'Mug Coffee', mid: 68, live: 'Yes', photo: false, video: false, link: '', comment: '', tag: 'yellow' },
]

interface PackState {
  rows: PackRow[]
  updateRow: (id: string, patch: Partial<PackRow>) => void
}

export const usePackStore = create<PackState>()(
  persist(
    (set) => ({
      rows: PRODUCT_ROWS,
      updateRow: (id, patch) => set((s) => ({
        rows: s.rows.map(r => r.id === id ? { ...r, ...patch } : r),
      })),
    }),
    { name: 'productos-pack' }
  )
)
