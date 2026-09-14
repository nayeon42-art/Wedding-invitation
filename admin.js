import {
  auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, getDocs
} from "./firebase.js";

const $ = id => document.getElementById(id);
let guests = [];

$("adminForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("adminError").hidden = true;
  try {
    await signInWithEmailAndPassword(auth, $("adminEmail").value.trim(), $("adminPassword").value);
  } catch (err) {
    $("adminError").hidden = false;
    $("adminError").textContent = "فشل تسجيل الدخول. تأكدي من الإيميل وكلمة المرور.";
  }
});

$("logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async user => {
  if (!user) {
    $("adminLogin").hidden = false;
    $("dashboard").hidden = true;
    return;
  }
  $("adminLogin").hidden = true;
  $("dashboard").hidden = false;
  try {
    const snap = await getDocs(collection(db, "guests"));
    guests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  } catch (err) {
    $("guestRows").innerHTML = `<tr><td colspan="5" class="empty">لا يمكن قراءة البيانات. راجعي Firestore Rules.</td></tr>`;
    console.error(err);
  }
});

function render() {
  const q = ($("search").value || "").toLowerCase().trim();
  const filtered = guests.filter(g => `${g.name || ""} ${g.email || ""}`.toLowerCase().includes(q));

  $("total").textContent = guests.length;
  $("yes").textContent = guests.filter(g => g.attendance === "yes").length;
  $("no").textContent = guests.filter(g => g.attendance === "no").length;
  $("people").textContent = guests.filter(g => g.attendance === "yes")
    .reduce((sum,g) => sum + 1 + Number(g.companions || 0), 0);

  $("guestRows").innerHTML = filtered.length ? filtered.map(g => `
    <tr>
      <td><b>${escapeHtml(g.name)}</b></td>
      <td>${escapeHtml(g.email)}</td>
      <td>${Number(g.companions || 0)}</td>
      <td><span class="status ${g.attendance || "pending"}">${status(g.attendance)}</span></td>
      <td><code>${escapeHtml(g.invitationCode || "")}</code></td>
    </tr>
  `).join("") : `<tr><td colspan="5" class="empty">لا توجد دعوات.</td></tr>`;
}
function status(s) { return s === "yes" ? "سيحضر" : s === "no" ? "لن يحضر" : "لم يؤكد"; }
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
$("search").addEventListener("input", render);
