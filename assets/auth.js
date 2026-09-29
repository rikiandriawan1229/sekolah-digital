// Modul auth bersama untuk semua halaman guru: login, logout, penjaga role, menu.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

const MENU = [
  { id: 'nilai',   href: 'input-nilai.html',   label: '📝 Input Nilai',  roles: ['admin', 'guru'] },
  { id: 'absensi', href: 'absensi-siswa.html', label: '🗓️ Absensi',      roles: ['admin', 'guru'] },
  { id: 'rekap',   href: 'rekap-nilai.html',   label: '📊 Rekap Nilai',  roles: ['admin', 'guru', 'kepsek'] },
];

function toast(msg) {
  const t = document.getElementById('toast'); if (!t) return alert(msg);
  t.textContent = msg; t.className = 'toast show warning';
  setTimeout(() => t.classList.remove('show'), 2600);
}
const $ = id => document.getElementById(id);

window.doLogin = async () => {
  const email = $('login-email').value.trim(), pass = $('login-pass').value;
  if (!email || !pass) return toast('Isi email & kata sandi');
  try { await signInWithEmailAndPassword(auth, email, pass); }
  catch { toast('❌ Login gagal: periksa email/kata sandi'); }
};
window.doLogout = () => signOut(auth);

// halaman: 'nilai' | 'absensi' | 'rekap'. onReady({nama, role, uid}) dipanggil setelah login sah.
export function initGuru({ halaman, onReady }) {
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement?.id?.startsWith('login-')) window.doLogin();
  });
  onAuthStateChanged(auth, async (user) => {
    document.body.classList.add('auth-ready');
    // Sesi anonim milik siswa bukan guru: keluarkan
    if (user && user.isAnonymous) { await signOut(auth); return; }
    if (!user) { $('login-screen').style.display = 'block'; $('app-content').style.display = 'none'; return; }

    const snap = await get(ref(db, `users/${user.uid}`));
    const prof = snap.exists() ? snap.val() : {};
    const role = ['admin', 'guru', 'kepsek'].includes(prof.role) ? prof.role : 'guru';
    const nama = prof.nama || user.email;

    const boleh = MENU.find(m => m.id === halaman)?.roles.includes(role);
    if (!boleh) { location.replace('rekap-nilai.html'); return; }

    const nav = document.querySelector('.app-nav');
    if (nav) nav.innerHTML = MENU.filter(m => m.roles.includes(role))
      .map(m => `<a class="app-nav-link${m.id === halaman ? ' active' : ''}" href="${m.href}">${m.label}</a>`).join('')
      + '<a class="app-nav-link" href="index.html">🏠 Menu</a>';

    $('user-badge').textContent = `👤 ${nama}${role !== 'guru' ? ' · ' + role : ''}`;
    $('login-screen').style.display = 'none';
    $('app-content').style.display = 'block';
    await onReady?.({ nama, role, uid: user.uid });
  });
}
