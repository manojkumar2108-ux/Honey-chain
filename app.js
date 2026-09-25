/* =========================================================
   LOGIN
   Email / Phone Number
   ========================================================= */

let loginContactMode = "email";


/* =========================================================
   OPEN LOGIN
   ========================================================= */

function openLogin(role) {

  currentRole = role;

  closeModal("roleModal");

  const loginRole =
    document.getElementById("loginRole");

  if (loginRole) {
    loginRole.textContent = role;
  }

  const loginModal =
    document.getElementById("loginModal");

  if (loginModal) {

    loginModal.style.display = "flex";

    setupLoginContact();

    clearLoginFields();
  }
}


/* =========================================================
   SETUP EMAIL / PHONE OPTIONS
   ========================================================= */

function setupLoginContact() {

  const contactInput =
    document.getElementById("loginContact");

  if (!contactInput) {
    return;
  }

  /*
   * Check whether buttons already exist.
   * This prevents duplicate buttons.
   */

  if (
    document.getElementById("loginEmailOption") &&
    document.getElementById("loginPhoneOption")
  ) {

    updateLoginContactUI();

    return;
  }


  /*
   * Create option container
   */

  const container =
    document.createElement("div");

  container.id =
    "loginContactOptions";

  container.style.display =
    "flex";

  container.style.gap =
    "10px";

  container.style.marginBottom =
    "12px";


  /*
   * Email button
   */

  const emailButton =
    document.createElement("button");

  emailButton.type =
    "button";

  emailButton.id =
    "loginEmailOption";

  emailButton.textContent =
    "Email";


  /*
   * Phone button
   */

  const phoneButton =
    document.createElement("button");

  phoneButton.type =
    "button";

  phoneButton.id =
    "loginPhoneOption";

  phoneButton.textContent =
    "Phone Number";


  /*
   * Common button style
   */

  [emailButton, phoneButton].forEach(
    button => {

      button.style.flex =
        "1";

      button.style.padding =
        "10px";

      button.style.borderRadius =
        "8px";

      button.style.border =
        "1px solid #f5c542";

      button.style.cursor =
        "pointer";

      button.style.fontWeight =
        "600";

      button.style.fontSize =
        "14px";

    }
  );


  /*
   * Add buttons
   */

  container.appendChild(
    emailButton
  );

  container.appendChild(
    phoneButton
  );


  /*
   * Insert buttons before input
   */

  contactInput.parentElement?.insertBefore(
    container,
    contactInput
  );


  /*
   * Email click
   */

  emailButton.addEventListener(
    "click",
    function () {

      loginContactMode =
        "email";

      updateLoginContactUI();

      clearLoginContactOnly();

    }
  );


  /*
   * Phone click
   */

  phoneButton.addEventListener(
    "click",
    function () {

      loginContactMode =
        "phone";

      updateLoginContactUI();

      clearLoginContactOnly();

    }
  );


  updateLoginContactUI();
}


/* =========================================================
   UPDATE EMAIL / PHONE UI
   ========================================================= */

function updateLoginContactUI() {

  const input =
    document.getElementById(
      "loginContact"
    );

  const label =
    document.querySelector(
      'label[for="loginContact"]'
    );

  const emailButton =
    document.getElementById(
      "loginEmailOption"
    );

  const phoneButton =
    document.getElementById(
      "loginPhoneOption"
    );


  if (!input) {
    return;
  }


  /* =====================================================
     EMAIL MODE
     ===================================================== */

  if (
    loginContactMode === "email"
  ) {

    if (label) {

      label.textContent =
        "Email";

    }


    input.type =
      "email";

    input.inputMode =
      "email";

    input.placeholder =
      "Enter email";

    input.autocomplete =
      "off";


    if (emailButton) {

      emailButton.style.background =
        "#f5c542";

      emailButton.style.color =
        "#111";

    }


    if (phoneButton) {

      phoneButton.style.background =
        "transparent";

      phoneButton.style.color =
        "#f5c542";

    }

  }


  /* =====================================================
     PHONE MODE
     ===================================================== */

  else {

    if (label) {

      label.textContent =
        "Phone Number";

    }


    input.type =
      "tel";

    input.inputMode =
      "tel";

    input.placeholder =
      "Enter phone number";

    input.autocomplete =
      "off";


    if (phoneButton) {

      phoneButton.style.background =
        "#f5c542";

      phoneButton.style.color =
        "#111";

    }


    if (emailButton) {

      emailButton.style.background =
        "transparent";

      emailButton.style.color =
        "#f5c542";

    }

  }
}


/* =========================================================
   CLEAR LOGIN CONTACT
   ========================================================= */

function clearLoginContactOnly() {

  const input =
    document.getElementById(
      "loginContact"
    );

  if (input) {

    input.value =
      "";

    input.removeAttribute(
      "value"
    );

  }
}


/* =========================================================
   CLEAR LOGIN FIELDS
   ========================================================= */

function clearLoginFields() {

  const contactInput =
    document.getElementById(
      "loginContact"
    );

  const passwordInput =
    document.getElementById(
      "loginPassword"
    );


  if (contactInput) {

    contactInput.value =
      "";

    contactInput.setAttribute(
      "autocomplete",
      "off"
    );

    contactInput.removeAttribute(
      "value"
    );
  }


  if (passwordInput) {

    passwordInput.value =
      "";

    passwordInput.setAttribute(
      "autocomplete",
      "new-password"
    );

    passwordInput.removeAttribute(
      "value"
    );
  }


  /*
   * Browser autofill sometimes happens
   * after JavaScript runs.
   *
   * So clear once more after a
   * short delay.
   */

  setTimeout(
    function () {

      if (contactInput) {

        contactInput.value =
          "";

      }


      if (passwordInput) {

        passwordInput.value =
          "";

      }

    },
    200
  );
}


/* =========================================================
   NORMALIZE INDIAN PHONE NUMBER
   ========================================================= */

function normalizeIndianPhone(
  phone
) {

  let value =
    phone.replace(
      /[^\d+]/g,
      ""
    );


  /*
   * +919876543210
   */

  if (
    value.startsWith("+91")
  ) {

    value =
      value.substring(3);

  }


  /*
   * 919876543210
   */

  else if (
    value.startsWith("91") &&
    value.length === 12
  ) {

    value =
      value.substring(2);

  }


  value =
    value.replace(
      /\D/g,
      ""
    );


  /*
   * Indian mobile number
   */

  if (
    !/^[6-9]\d{9}$/.test(
      value
    )
  ) {

    return null;

  }


  return "+91" + value;
}


/* =========================================================
   LOGIN USER
   ========================================================= */

async function loginUser(event) {

  event.preventDefault();


  /* =====================================================
     GET FORM ELEMENTS
     ===================================================== */

  const contactElement =
    document.getElementById(
      "loginContact"
    );

  const passwordElement =
    document.getElementById(
      "loginPassword"
    );


  if (
    !contactElement ||
    !passwordElement
  ) {

    showError(
      "Login form fields are missing."
    );

    return;
  }


  const contact =
    contactElement.value.trim();

  const password =
    passwordElement.value;


  /* =====================================================
     VALIDATION
     ===================================================== */

  if (!contact) {

    showError(
      loginContactMode === "phone"
        ? "Please enter your phone number."
        : "Please enter your email address."
    );

    return;
  }


  if (!password) {

    showError(
      "Please enter your password."
    );

    return;
  }


  /* =====================================================
     LOGIN
     ===================================================== */

  try {

    let loginData;
    let loginError;


    /* ===================================================
       EMAIL LOGIN
       =================================================== */

    if (
      loginContactMode === "email"
    ) {

      if (
        !contact.includes("@")
      ) {

        showError(
          "Please enter a valid email address."
        );

        return;
      }


      const result =
        await db.auth.signInWithPassword({

          email:
            contact,

          password:
            password

        });


      loginData =
        result.data;

      loginError =
        result.error;

    }


    /* ===================================================
       PHONE LOGIN
       =================================================== */

    else {

      const phone =
        normalizeIndianPhone(
          contact
        );


      if (!phone) {

        showError(
          "Please enter a valid 10-digit Indian mobile number."
        );

        return;
      }


      const result =
        await db.auth.signInWithPassword({

          phone:
            phone,

          password:
            password

        });


      loginData =
        result.data;

      loginError =
        result.error;

    }


    /* ===================================================
       LOGIN ERROR
       =================================================== */

    if (loginError) {

      console.error(
        "Login error:",
        loginError
      );


      showError(
        loginError.message
      );

      return;
    }


    /* ===================================================
       USER CHECK
       =================================================== */

    if (
      !loginData ||
      !loginData.user
    ) {

      showError(
        "Login failed."
      );

      return;
    }


    const user =
      loginData.user;


    /* ===================================================
       CREATE / UPDATE PROFILE
       =================================================== */

    const profileResult =
      await createUserProfileAfterLogin(
        user
      );


    if (
      !profileResult.success
    ) {

      showError(
        profileResult.message
      );

      return;
    }


    /* ===================================================
       CLOSE LOGIN MODAL
       =================================================== */

    closeModal(
      "loginModal"
    );


    /* ===================================================
       GET ROLE
       =================================================== */

    const role =
      user.user_metadata?.role ||
      "buyer";


    let displayRole =
      "Buyer";


    if (
      role === "seller"
    ) {

      displayRole =
        "Seller";

    }


    else if (
      role === "beekeeper"
    ) {

      displayRole =
        "Beekeeper";

    }


    currentRole =
      displayRole;


    /* ===================================================
       CLEAR LOGIN DATA
       =================================================== */

    clearLoginFields();


    /* ===================================================
       SUCCESS
       =================================================== */

    alert(
      "Login successful!"
    );


    /* ===================================================
       SHOW DASHBOARD
       =================================================== */

    await showUserDashboard(
      displayRole,
      user.email ||
      user.phone ||
      contact
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
