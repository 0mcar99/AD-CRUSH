import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment files.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Action A: Save a New Visitor's Email
export async function saveVisitor(email, browserMeta) {
  // upsert will insert if new, or do nothing/update if email already exists
  const { data, error } = await supabase
    .from('visitors')
    .upsert({ email: email, browser_info: browserMeta }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('Error saving visitor:', error)
    return null
  }
  
  // Return the visitor data (which includes their unique ID)
  return data && data.length > 0 ? data[0] : null; 
}

// Action B: Send a Message (User or Admin)
export async function sendMessage(visitorId, senderType, messageText) {
  const { data, error } = await supabase
    .from('chats')
    .insert([
      { visitor_id: visitorId, sender: senderType, message: messageText }
    ])

  if (error) {
    console.error('Error sending message:', error)
  }
  return data;
}

// Action C: Fetch the Chat History
export async function getChatHistory(visitorId) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('visitor_id', visitorId)
    .order('created_at', { ascending: true })

  if (error) console.error('Error loading chats:', error)
  return data;
}
