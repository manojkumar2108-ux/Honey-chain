/* =========================================================
   HoneyTrace - Supabase Application
   Auth + Email Verification + Profile Creation
   ========================================================= */

let currentRole = "Buyer";
let batchNumber = 1;

const db = window.honeyTraceDB;


/* =========================================================
   HELPERS
   ========================================================= */

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth"
  });
}


function showError(message) {
  alert(message);
}


/* =========================================================
   ROLE NORMALIZATION
   ========================================================= */

function normalizeRole(role) {

  if (role === "Seller") {
    return "seller";
  }

  if (role === "Beekeeper") {
    return "beekeeper";
  }

  return "buyer";
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(date) {

  if (!date) {
    return "-";
  }

  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}


/* =========================================================
   HASH
   ========================================================= */

async function makeHash(value) {

  const bytes = new TextEncoder().encode(value);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    bytes
  );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}


/* =========================================================
   GENERATE BATCH ID
   ========================================================= */

function generateBatchId() {

  const year = new Date().getFullYear();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `HNY-${year}-${random}`;
}


/* =========================================================
   ROLE / MODAL
   ========================================================= */

function openRoleSelection() {

  const modal = document.getElementById("roleModal");

  if (modal) {
    modal.style.display = "flex";
  }
}


function openLogin(role) {

  currentRole = role;

  closeModal("roleModal");

  const loginRole = document.getElementById("loginRole");

  if (loginRole) {
    loginRole.textContent = role;
  }

  const loginModal = document.getElementById("loginModal");

  if (loginModal) {
    loginModal.style.display = "flex";
  }
}


function openRegister() {

  closeModal("loginModal");

  const registerRole =
    document.getElementById("registerRole");

  if (registerRole) {
    registerRole.textContent = currentRole;
  }

  const registerModal =
    document.getElementById("registerModal");

  if (registerModal) {
    registerModal.style.display = "flex";
  }
}


function closeModal(id) {

  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}


/* =========================================================
   SUPABASE AUTH
   REGISTER
   ========================================================= */

async function registerUser(event) {

  event.preventDefault();


  /* ---------- GET FORM VALUES ---------- */

  const nameElement =
    document.getElementById("registerName");

  const emailElement =
    document.getElementById("registerEmail");

  const passwordElement =
    document.getElementById("registerPassword");

  const confirmPasswordElement =
    document.getElementById(
      "registerConfirmPassword"
    );


  if (
    !nameElement ||
    !emailElement ||
    !passwordElement ||
    !confirmPasswordElement
  ) {

    showError(
      "Registration form fields are missing."
    );

    return;
  }


  const name =
    nameElement.value.trim();

  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;

  const confirmPassword =
    confirmPasswordElement.value;


  /* ---------- VALIDATION ---------- */

  if (!name) {

    showError(
      "Please enter your name."
    );

    return;
  }


  if (!email || !email.includes("@")) {

    showError(
      "Please enter a valid email address."
    );

    return;
  }


  if (password.length < 6) {

    showError(
      "Password must contain at least 6 characters."
    );

    return;
  }


  if (password !== confirmPassword) {

    showError(
      "Passwords do not match."
    );

    return;
  }


  /* ---------- ROLE ---------- */

  const role =
    normalizeRole(currentRole);


  try {

    /* =====================================================
       CREATE SUPABASE AUTH USER

       IMPORTANT:
       Database profile is NOT created here.

       Email confirmation must happen first.
       ===================================================== */

    const { data, error } =
      await db.auth.signUp({

        email: email,

        password: password,

        options: {

          data: {

            full_name: name,

            role: role

          }

        }

      });


    /* ---------- SUPABASE ERROR ---------- */

    if (error) {

      console.error(
        "Registration error:",
        error
      );

      showError(
        error.message
      );

      return;
    }


    /* ---------- USER CHECK ---------- */

    if (!data || !data.user) {

      showError(
        "Registration failed. User was not created."
      );

      return;
    }


    const user = data.user;


    /* =====================================================
       IMPORTANT

       DO NOT CREATE profiles HERE.

       Email verification is required first.
       ===================================================== */


    closeModal(
      "registerModal"
    );


    /* =====================================================
       IF EMAIL CONFIRMATION IS ENABLED

       data.session will normally be null.
       ===================================================== */

    if (!data.session) {

      alert(
        "Registration successful!\n\n" +
        "Verification email has been sent to:\n" +
        email +
        "\n\n" +
        "Please confirm your email and then login."
      );


      openLogin(
        currentRole
      );


      return;
    }


    /* =====================================================
       IF EMAIL CONFIRMATION IS DISABLED
       ===================================================== */

    await createUserProfileAfterLogin(
      user
    );


    alert(
      "Registration successful!"
    );


    await showUserDashboard(
      currentRole,
      user.email || email
    );

  }


  catch (err) {

    console.error(
      "Unexpected registration error:",
      err
    );

    showError(
      "Something went wrong during registration.\n\n" +
      err.message
    );
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(event) {

  event.preventDefault();


  const emailElement =
    document.getElementById(
      "loginContact"
    );

  const passwordElement =
    document.getElementById(
      "loginPassword"
    );


  if (
    !emailElement ||
    !passwordElement
  ) {

    showError(
      "Login form fields are missing."
    );

    return;
  }


  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  /* ---------- VALIDATION ---------- */

  if (!email || !email.includes("@")) {

    showError(
      "Please enter a valid email address."
    );

    return;
  }


  if (!password) {

    showError(
      "Please enter your password."
    );

    return;
  }


  try {

    /* =====================================================
       LOGIN

       If email is not confirmed,
       Supabase will reject the login.
       ===================================================== */

    const { data, error } =
      await db.auth.signInWithPassword({

        email: email,

        password: password

      });


    /* ---------- LOGIN ERROR ---------- */

    if (error) {

      console.error(
        "Login error:",
        error
      );

      showError(
        error.message
      );

      return;
    }


    if (!data || !data.user) {

      showError(
        "Login failed."
      );

      return;
    }


    const user =
      data.user;


    /* =====================================================
       EMAIL CONFIRMED

       NOW create application database records.
       ===================================================== */

    const profileResult =
      await createUserProfileAfterLogin(
        user
      );


    if (!profileResult.success) {

      showError(
        profileResult.message
      );

      return;
    }


    /* ---------- CLOSE LOGIN ---------- */

    closeModal(
      "loginModal"
    );


    /* ---------- GET ROLE ---------- */

    const role =
      user.user_metadata?.role ||
      "buyer";


    let displayRole =
      "Buyer";


    if (role === "seller") {

      displayRole = "Seller";

    }
    else if (role === "beekeeper") {

      displayRole = "Beekeeper";
    }


    currentRole =
      displayRole;


    /* ---------- SUCCESS ---------- */

    alert(
      "Login successful!"
    );


    await showUserDashboard(
      displayRole,
      user.email
    );

  }


  catch (err) {

    console.error(
      "Unexpected login error:",
      err
    );

    showError(
      "Something went wrong during login.\n\n" +
      err.message
    );
  }
}


/* =========================================================
   CREATE PROFILE AFTER SUCCESSFUL LOGIN
   ========================================================= */

async function createUserProfileAfterLogin(user) {

  try {

    const userId =
      user.id;


    const fullName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User";


    const role =
      user.user_metadata?.role ||
      "buyer";


    /* =====================================================
       CREATE / UPDATE MAIN PROFILE
       ===================================================== */

    const profileData = {

      user_id: userId,

      full_name: fullName,

      role: role

    };


    const {
      error: profileError
    } = await db
      .from("profiles")
      .upsert(
        profileData,
        {
          onConflict: "user_id"
        }
      );


    if (profileError) {

      console.error(
        "Profile creation error:",
        profileError
      );


      return {

        success: false,

        message:
          "Login successful, but profile could not be created.\n\n" +
          profileError.message

      };
    }


    /* =====================================================
       BEEKEEPER PROFILE
       ===================================================== */

    if (role === "beekeeper") {

      const beekeeperData = {

        user_id: userId,

        beekeeper_name: fullName,

        apiary_name: "",

        phone: "",

        address: "",

        location: "",

        bee_species: "",

        hive_count: 0

      };


      const {
        error: beekeeperError
      } = await db
        .from("beekeeper_profiles")
        .upsert(
          beekeeperData,
          {
            onConflict: "user_id"
          }
        );


      if (beekeeperError) {

        console.error(
          "Beekeeper profile error:",
          beekeeperError
        );


        return {

          success: false,

          message:
            "Profile created, but beekeeper profile could not be created.\n\n" +
            beekeeperError.message

        };
      }
    }


    /* =====================================================
       SELLER PROFILE
       ===================================================== */

    if (role === "seller") {

      const sellerData = {

        user_id: userId,

        seller_name: fullName,

        business_name: "",

        phone: "",

        address: ""

      };


      const {
        error: sellerError
      } = await db
        .from("seller_profiles")
        .upsert(
          sellerData,
          {
            onConflict: "user_id"
          }
        );


      if (sellerError) {

        console.error(
          "Seller profile error:",
          sellerError
        );


        return {

          success: false,

          message:
            "Profile created, but seller profile could not be created.\n\n" +
            sellerError.message

        };
      }
    }


    /* =====================================================
       SUCCESS
       ===================================================== */

    return {

      success: true,

      message:
        "Profile created successfully."

    };

  }


  catch (err) {

    console.error(
      "Profile creation exception:",
      err
    );


    return {

      success: false,

      message:
        "Profile creation failed.\n\n" +
        err.message

    };
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  try {

    const {
      error
    } = await db.auth.signOut();


    if (error) {

      console.error(
        "Logout error:",
        error
      );

      showError(
        error.message
      );

      return;
    }


    currentRole =
      "Buyer";


    alert(
      "Logged out successfully."
    );


    location.reload();

  }


  catch (err) {

    console.error(
      "Logout exception:",
      err
    );

    showError(
      "Logout failed.\n\n" +
      err.message
    );
  }
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function getCurrentUser() {

  try {

    const {
      data,
      error
    } = await db.auth.getUser();


    if (error) {

      console.error(
        "Get user error:",
        error
      );

      return null;
    }


    return data.user || null;

  }


  catch (err) {

    console.error(
      "Get current user exception:",
      err
    );

    return null;
  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function showUserDashboard(
  role,
  contact
) {

  console.log(
    "Dashboard:",
    role,
    contact
  );


  /* =====================================================
     SELLER
     ===================================================== */

  if (role === "Seller") {

    await loadSellerProfile();

    await loadSellerBatches();

  }


  /* =====================================================
     BEEKEEPER
     ===================================================== */

  if (role === "Beekeeper") {

    await loadBeekeeperProfile();

  }


  /* =====================================================
     BUYER
     ===================================================== */

  if (role === "Buyer") {

    console.log(
      "Buyer dashboard loaded."
    );

  }
}


/* =========================================================
   LOAD SELLER PROFILE
   ========================================================= */

async function loadSellerProfile() {

  const user =
    await getCurrentUser();


  if (!user) {
    return;
  }


  const {
    data,
    error
  } = await db
    .from("seller_profiles")
    .select("*")
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();


  if (error) {

    console.error(
      "Seller profile load error:",
      error
    );

    return;
  }


  console.log(
    "Seller Profile:",
    data
  );
}


/* =========================================================
   LOAD BEEKEEPER PROFILE
   ========================================================= */

async function loadBeekeeperProfile() {

  const user =
    await getCurrentUser();


  if (!user) {
    return;
  }


  const {
    data,
    error
  } = await db
    .from("beekeeper_profiles")
    .select("*")
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();


  if (error) {

    console.error(
      "Beekeeper profile load error:",
      error
    );

    return;
  }


  console.log(
    "Beekeeper Profile:",
    data
  );
}


/* =========================================================
   LOAD SELLER BATCHES
   ========================================================= */

async function loadSellerBatches() {

  const user =
    await getCurrentUser();


  if (!user) {
    return;
  }


  const {
    data,
    error
  } = await db
    .from("honey_batches")
    .select("*")
    .eq(
      "seller_id",
      user.id
    );


  if (error) {

    console.error(
      "Honey batches load error:",
      error
    );

    return;
  }


  console.log(
    "Seller Honey Batches:",
    data
  );
}


/* =========================================================
   AUTH SESSION CHECK
   ========================================================= */

async function checkAuthSession() {

  try {

    const {
      data,
      error
    } = await db.auth.getSession();


    if (error) {

      console.error(
        "Session error:",
        error
      );

      return;
    }


    if (
      data &&
      data.session &&
      data.session.user
    ) {

      const user =
        data.session.user;


      const role =
        user.user_metadata?.role ||
        "buyer";


      let displayRole =
        "Buyer";


      if (role === "seller") {

        displayRole =
          "Seller";

      }
      else if (role === "beekeeper") {

        displayRole =
          "Beekeeper";
      }


      currentRole =
        displayRole;


      /*
       * User is already authenticated.
       * Make sure application profile exists.
       */

      await createUserProfileAfterLogin(
        user
      );


      await showUserDashboard(
        displayRole,
        user.email
      );
    }

  }


  catch (err) {

    console.error(
      "Session check error:",
      err
    );
  }
}


/* =========================================================
   SUPABASE AUTH STATE CHANGE
   ========================================================= */

db.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      "Auth event:",
      event
    );


    if (
      event === "SIGNED_IN" &&
      session &&
      session.user
    ) {

      const user =
        session.user;


      /*
       * Profile is created only after
       * successful authenticated session.
       */

      await createUserProfileAfterLogin(
        user
      );
    }


    if (
      event === "SIGNED_OUT"
    ) {

      console.log(
        "User signed out."
      );
    }
  }
);


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "HoneyTrace application loaded."
    );


    await checkAuthSession();

  }
);