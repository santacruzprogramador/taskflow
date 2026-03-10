
// supabase-config.js
const supabaseUrl = 'https://kxllxvlmbprzxwumbpgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bGx4dmxtYnByenh3dW1icGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODA5NjEsImV4cCI6MjA4NTI1Njk2MX0.MarICxVbaqaZOkxpBewUYFkfpUMEjWmllEJwjIbUX6U'

/* modo modulos 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
window.supabaseClient = supabase */


window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

