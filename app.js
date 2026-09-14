import {
  auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp
} from "./firebase.js";

const EVENT_DATE = new Date("2026-12-18T20:00:00+03:00");
const $ = id => document.getElementById(id);
let currentGuest = null;

function showError(message) {
  $("authMessage").hidden = false;
  $("authMessage").textContent = message;
}

function code() {
  return "WED-" + crypto.getRandomValues(new Uint32Array(2)).join("").slice(0, 10);
}

async function findGuestByUid(uid) {
  const snap = await getDocs(query(collection(db, "guests"), where("uid", "==", uid)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

async function saveGuest(uid, name, email, companions) {
  const old = await findGuestByUid(uid);
  if (old) {
    await updateDoc(doc(db, "guests", old.id), {
      name, email, companions: Number(companions), updatedAt: serverTimestamp()
    });
    return { ...old, name, email, companions: Number(companions) };
  }

  const data = {
    uid, name, email, companions: Number(companions),
    attendance: "pending",
    note: "",
    invitationCode: code(),
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, "guests"), data);
  return { id: ref.id, ...data };
}

$("guestForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("loginButton").disabled = true;
  $("authMessage").hidden = true;

  const name = $("name").value.trim();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const companions = Number($("companions").value);

  try {
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        credential = await signInWithEmailAndPassword(auth, email, password);
      } else throw err;
    }

    currentGuest = await saveGuest(credential.user.uid, name, email, companions);
    openInvitation(currentGuest);
  } catch (err) {
    const messages = {
      "auth/invalid-credential": "الإيميل أو كلمة المرور غير صحيحة.",
      "auth/weak-password": "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      "auth/invalid-email": "البريد الإلكتروني غير صحيح.",
      "auth/too-many-requests": "محاولات كثيرة. حاولي لاحقًا."
    };
    showError(messages[err.code] || "حدث خطأ أثناء تسجيل الدخول. تأكدي من إعدادات Firebase.");
  } finally {
    $("loginButton").disabled = false;
  }
});

function openInvitation(guest) {
  currentGuest = guest;
  $("loginSection").hidden = true;
  $("invitation").hidden = false;
  renderQR(guest.invitationCode);
  if (guest.attendance !== "pending") {
    document.querySelector(`input[name="attendance"][value="${guest.attendance}"]`).checked = true;
  }
  $("note").value = guest.note || "";
}

$("rsvpForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentGuest) return;

  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  const note = $("note").value.trim();

  try {
    await updateDoc(doc(db, "guests", currentGuest.id), {
      attendance, note, updatedAt: serverTimestamp()
    });
    currentGuest.attendance = attendance;
    currentGuest.note = note;
    $("rsvpMessage").hidden = false;
    $("rsvpMessage").textContent = attendance === "yes"
      ? "تم تأكيد حضورك بنجاح. ننتظركم بكل سرور."
      : "تم تسجيل اعتذارك، وشكرًا لإبلاغنا.";
  } catch {
    $("rsvpMessage").hidden = false;
    $("rsvpMessage").textContent = "تعذر حفظ التأكيد. تأكدي من اتصال الإنترنت وقواعد Firestore.";
  }
});

function renderQR(invitationCode) {
  $("guestCode").textContent = invitationCode;
  $("qrcode").innerHTML = "";
  new QRCode($("qrcode"), {
    text: invitationCode,
    width: 190, height: 190,
    correctLevel: QRCode.CorrectLevel.H
  });
}

function updateCountdown() {
  const diff = EVENT_DATE - new Date();
  const v = diff > 0
    ? [Math.floor(diff/86400000), Math.floor(diff/3600000)%24, Math.floor(diff/60000)%60, Math.floor(diff/1000)%60]
    : [0,0,0,0];
  ["days","hours","minutes","seconds"].forEach((id,i) => $(id).textContent = String(v[i]).padStart(2,"0"));
}
setInterval(updateCountdown, 1000);
updateCountdown();

onAuthStateChanged(auth, async user => {
  if (!user) return;
  try {
    const guest = await findGuestByUid(user.uid);
    if (guest) {
      $("name").value = guest.name || "";
      $("email").value = guest.email || user.email || "";
      $("companions").value = guest.companions ?? 0;
      openInvitation(guest);
    }
  } catch (err) {
    console.error(err);
  }
});
