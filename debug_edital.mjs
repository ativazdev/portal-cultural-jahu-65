import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ymkytnhdslvkigzilbvy.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw"

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  console.log('--- Checking all editais ---')
  const { data: editais, error: editalError } = await supabase
    .from('editais')
    .select('id, nome, codigo, status')
  
  if (editalError) console.error('Edital error:', editalError)
  else {
    console.log('Total editais found:', editais?.length)
    editais?.forEach(e => console.log(`- ${e.id}: [${e.codigo}] ${e.nome} (${e.status})`))
  }

  console.log('\n--- Checking arquivos_edital ---')
  const { count, error: countError } = await supabase
    .from('arquivos_edital')
    .select('*', { count: 'exact', head: true })
  
  if (countError) console.error('Count error:', countError)
  else console.log('Total files in arquivos_edital:', count)
}

debug()
