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
  console.log('[DELETE USER] Request body:', req.body);
  const { userId } = req.body;
  if (!userId) {
    console.log('[DELETE USER] Missing userId');
    return res.status(400).json({ error: 'User ID required' });
  }

  // Optionally: Add authentication/authorization here

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.log('[DELETE USER] Supabase error object:', error);
    return res.status(400).json({ error: error.message, details: error });
  }
  console.log('[DELETE USER] Success for userId:', userId);
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