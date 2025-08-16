(function(){
  const API_BASE = (typeof window !== 'undefined') ? (window.API_BASE || 'http://localhost:5000') : 'http://localhost:5000';

  function saveToken(token){
    try{ localStorage.setItem('taskletix_admin_token', token); }catch(e){}
  }
  function getToken(){
    try{ return localStorage.getItem('taskletix_admin_token'); }catch(e){ return null; }
  }
  function authHeaders(){
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  async function requestJSON(url, options){
    const resp = await fetch(url, {
      ...options,
      headers:{ 'Content-Type': 'application/json', ...(options && options.headers || {}), ...authHeaders() },
      credentials: 'omit'
    });
    const ct = resp.headers.get('content-type') || '';
    if (!ct.includes('application/json')){
      return { ok:false, error:'Unexpected response' };
    }
    const data = await resp.json();
    return data;
  }

  // Login page logic
  const loginForm = document.getElementById('login-form');
  if (loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const password = document.getElementById('password').value.trim();
      const out = document.getElementById('login-error');
      out.style.display = 'none';
      const res = await requestJSON(API_BASE + '/api/admin/login', { method:'POST', body: JSON.stringify({ password }) });
      if (!res.ok){
        out.textContent = res.error || 'Login failed';
        out.style.display = 'block';
        return;
      }
      saveToken(res.token);
      window.location.href = 'admin-dashboard.html';
    });
  }

  // Dashboard logic
  const table = document.getElementById('submissions-table');
  if (table){
    const tbody = table.querySelector('tbody');
    const searchEl = document.getElementById('search');
    const refreshBtn = document.getElementById('refresh');
    const downloadBtn = document.getElementById('download');

    function renderRows(items){
      tbody.innerHTML = '';
      for (const s of items){
        const tr = document.createElement('tr');
        const cells = [
          s.id,
          s.name,
          s.email,
          s.phone || '',
          s.country_code || '',
          s.company || '',
          s.project_type || '',
          s.budget_range || '',
          s.timeline || '',
          s.created_at ? new Date(s.created_at).toLocaleString() : '',
          s.project_details || ''
        ];
        cells.forEach((c)=>{
          const td = document.createElement('td');
          td.textContent = c;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
    }

    async function loadData(){
      const res = await requestJSON(API_BASE + '/api/admin/submissions?limit=500', { method:'GET' });
      if (!res.ok){
        alert(res.error || 'Failed to load');
        return;
      }
      window.__allItems = res.submissions || [];
      applyFilter();
    }

    function applyFilter(){
      const q = (searchEl.value || '').toLowerCase();
      const items = (window.__allItems || []).filter((s)=>{
        const blob = [
          s.id,
          s.name,
          s.email,
          s.phone,
          s.country_code,
          s.company,
          s.project_type,
          s.budget_range,
          s.timeline,
          s.project_details
        ].join(' ').toLowerCase();
        return blob.includes(q);
      });
      renderRows(items);
    }

    searchEl.addEventListener('input', applyFilter);
    refreshBtn.addEventListener('click', loadData);
    downloadBtn.addEventListener('click', async ()=>{
      const t = getToken();
      if (!t){ alert('Not authorized'); return; }
      
      // Show loading state
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = 'Generating PDF...';
      downloadBtn.disabled = true;
      
      try {
        const url = API_BASE + '/api/admin/export/pdf';
        const resp = await fetch(url, { headers: authHeaders() });
        
        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${resp.status}: ${resp.statusText}`);
        }
        
        const blob = await resp.blob();
        
        // Check if we got a PDF
        if (blob.type !== 'application/pdf') {
          throw new Error('Server did not return a valid PDF file');
        }
        
        // Create download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'taskletix_submissions.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.textContent = 'PDF downloaded successfully!';
        successMsg.style.cssText = `
          position: fixed; top: 20px; right: 20px; 
          background: #10B981; color: white; padding: 12px 20px; 
          border-radius: 6px; z-index: 1000; font-weight: 500;
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
      } catch (error) {
        console.error('PDF download error:', error);
        alert(`Failed to download PDF: ${error.message}`);
      } finally {
        // Restore button state
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
      }
    });

    // initial
    loadData();
  }
})();


