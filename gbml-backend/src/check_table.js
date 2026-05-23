import { supabase } from './config/supabase.js';

async function checkTable() {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.log('RESULT: TABLE_NOT_FOUND');
      } else {
        console.error('RESULT: ERROR:', error);
      }
    } else {
      console.log('RESULT: TABLE_EXISTS');
    }
  } catch (err) {
    console.error('RESULT: EXCEPTION:', err);
  }
}

checkTable();
