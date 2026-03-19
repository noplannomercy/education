import { db } from './index'
import { categories } from './schema'

const defaultCategories = [
  { name: '식비', color: '#ef4444', icon: 'utensils' },
  { name: '교통', color: '#3b82f6', icon: 'car' },
  { name: '쇼핑', color: '#ec4899', icon: 'shopping-bag' },
  { name: '공과금', color: '#f59e0b', icon: 'receipt' },
  { name: '주거', color: '#10b981', icon: 'home' },
  { name: '의료', color: '#8b5cf6', icon: 'heart' },
  { name: '문화', color: '#6366f1', icon: 'coffee' },
  { name: '기타', color: '#64748b', icon: 'gift' },
]

async function seed() {
  console.log('Seeding categories...')

  for (const cat of defaultCategories) {
    try {
      await db.insert(categories).values(cat).onConflictDoNothing()
      console.log(`  ✓ ${cat.name}`)
    } catch (error) {
      console.log(`  ✗ ${cat.name} - Already exists or error`)
    }
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed error:', error)
  process.exit(1)
})
