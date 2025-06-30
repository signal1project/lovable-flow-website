const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post('/admin/delete-user', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Delete from profiles (cascades to brokers, lenders, admin_notes)
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
  if (profileError) {
    return res.status(400).json({ error: 'Error deleting profile', details: profileError });
  }

  // Now delete from Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return res.status(400).json({ error: authError.message, details: authError });
  }

  res.json({ success: true });
});

app.post('/admin/set-user-role', async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ error: 'Missing userId or role' });

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, data });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
}); 