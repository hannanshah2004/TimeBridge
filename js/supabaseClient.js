
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://niwyheedkdastjnidbmz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pd3loZWVka2Rhc3RqbmlkYm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjI0OTksImV4cCI6MjA1ODMzODQ5OX0.XKCYMg6leaeS4A8FIMnwZ9wdE_C9B_otA5cqj4-V1K0'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;