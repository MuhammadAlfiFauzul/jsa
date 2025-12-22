import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.json();

    // Validate required fields
    const requiredFields = ['nama', 'telp', 'kota', 'kecamatan', 'kelurahan', 'alamat'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return new Response(
          JSON.stringify({ error: `Field ${field} is required` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Sanitize input data
    const cleanData = {
      nama: formData.nama.trim(),
      telp: formData.telp.trim(),
      kota: formData.kota.trim(),
      kecamatan: formData.kecamatan.trim(),
      kelurahan: formData.kelurahan.trim(),
      alamat: formData.alamat.trim(),
      status: 'pending',
    };

    // Insert into database
    const { data, error } = await supabase
      .from('pendaftaran')
      .insert([cleanData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit registration' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pendaftaran berhasil! Tim kami akan menghubungi Anda segera.',
        data: { id: data.id },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});